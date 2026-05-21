import { Injectable } from '@nestjs/common';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { SaleOrder } from '../entity/sale_order.entity';
import { SaleOrderDetail } from '../entity/sale_order_detail.entity';
import { PaginationRequest } from '@/common/dto';
import { OrderStatus } from '@/common/enum/order_status.enum';

@Injectable()
export class SaleOrderRepository extends Repository<SaleOrder> {
  constructor(private dataSource: DataSource) {
    super(SaleOrder, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<SaleOrder | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleOrder[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('sale_order')
      .leftJoinAndSelect('sale_order.customer', 'customer')
      .leftJoinAndSelect('sale_order.details', 'details')
      .leftJoinAndSelect('details.product', 'product');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(sale_order.code ILIKE :search OR customer.name ILIKE :search OR sale_order.description ILIKE :search OR product.name ILIKE :search OR product.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        queryBuilder.andWhere('sale_order.status = :status', {
          status: Number(filter.status),
        });
      }
      if (filter.customerId) {
        queryBuilder.andWhere('sale_order.customerId = :customerId', {
          customerId: Number(filter.customerId),
        });
      }

      // Business Date Range: orderDate
      if (filter.startDate) {
        queryBuilder.andWhere('sale_order.orderDate >= :startDate', {
          startDate: new Date(filter.startDate),
        });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('sale_order.orderDate <= :endDate', { endDate });
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.')
        ? sortBy
        : `sale_order.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder);
    } else {
      queryBuilder.orderBy('sale_order.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }

  /**
   * Automatically heals orphaned fulfillment links.
   * Scans for invoices that should belong to this order but are missing the link.
   */
  async autoHealFulfillment(
    order: SaleOrder,
    manager?: EntityManager,
  ): Promise<void> {
    const mgr = manager || this.manager;
    if (order.isCancel) return;

    const { SaleInvoiceDetail } =
      await import('../../sale_invoice/entity/sale_invoice_detail.entity.js');
    const { SaleInvoice } =
      await import('../../sale_invoice/entity/sale_invoice.entity.js');

    order.totalLine = order.details?.length || 0;
    order.totalCloseLine = 0;

    for (const orderDetail of order.details) {
      // Calculate total invoiced quantity for this order detail
      const result = (await mgr
        .createQueryBuilder(SaleInvoiceDetail, 'sid')
        .select('SUM(sid.quantity)', 'totalInvoiced')
        .where('sid.sale_order_detail_id = :detailId', {
          detailId: orderDetail.id,
        })
        .getRawOne()) as unknown as
        | { totalInvoiced: string | null }
        | undefined;

      const totalInvoiced = Number(result?.totalInvoiced || 0);

      // Save invoiced quantity back to the detail
      orderDetail.invoicedQuantity = totalInvoiced;
      await mgr.save(SaleOrderDetail, orderDetail);

      // If already fully invoiced, count as closed
      if (totalInvoiced >= Number(orderDetail.quantity)) {
        order.totalCloseLine = (order.totalCloseLine || 0) + 1;
        continue;
      }

      // If not fully invoiced, try to find an orphaned match (legacy support)
      // but only if the remaining quantity matches exactly (simple healer logic)
      const remainingQty = Number(orderDetail.quantity) - totalInvoiced;

      const orphanedMatch = await mgr
        .createQueryBuilder(SaleInvoiceDetail, 'sid')
        .innerJoinAndSelect('sid.saleInvoice', 'si')
        .where('sid.saleOrderId IS NULL')
        .andWhere('si.customerId = :customerId', {
          customerId: order.customerId,
        })
        .andWhere('sid.productId = :productId', {
          productId: orderDetail.productId,
        })
        .andWhere('sid.quantity = :quantity', {
          quantity: remainingQty,
        })
        .andWhere('si.createdAt >= :orderDate', { orderDate: order.createdAt })
        .getOne();

      if (orphanedMatch) {
        orphanedMatch.saleOrderId = order.id;
        orphanedMatch.saleOrderDetailId = orderDetail.id;
        await mgr.save(SaleInvoiceDetail, orphanedMatch);
        orderDetail.invoicedQuantity = Number(orderDetail.quantity);
        await mgr.save(SaleOrderDetail, orderDetail);
        order.totalCloseLine = (order.totalCloseLine || 0) + 1;
      }
    }

    // Determine Status based on payment of linked invoices
    const linkedInvoices = (await mgr
      .createQueryBuilder(SaleInvoice, 'si')
      .innerJoin('sale_invoice_details', 'sid', 'sid.sale_invoice_id = si.id')
      .where('sid.sale_order_id = :orderId', { orderId: order.id })
      .select(['si.id', 'si.status', 'si.total_price', 'si.paid_amount'])
      .distinct(true)
      .getRawMany()) as unknown as Array<{
      si_id: number;
      si_status: number;
      si_total_price: string;
      si_paid_amount: string;
    }>;

    // Calculate invoicedAmount and paidAmount
    let paidAmount = 0;

    // We get the actual invoiced amount strictly from the details linked to this order
    const invoicedResult = (await mgr
      .createQueryBuilder(SaleInvoiceDetail, 'sid')
      .select('SUM(sid.total_price)', 'totalInvoiced')
      .where('sid.sale_order_id = :orderId', { orderId: order.id })
      .getRawOne()) as unknown as { totalInvoiced: string | null } | undefined;

    order.invoicedAmount = Number(invoicedResult?.totalInvoiced || 0);

    // For paid amount, we prorate the payment of each linked invoice based on this order's share of that invoice
    for (const inv of linkedInvoices) {
      const invTotal = Number(inv.si_total_price || 0);
      const invPaid = Number(inv.si_paid_amount || 0);
      if (invTotal > 0 && invPaid > 0) {
        // Find how much of THIS invoice belongs to THIS order
        const orderShareResult = (await mgr
          .createQueryBuilder(SaleInvoiceDetail, 'sid')
          .select('SUM(sid.total_price)', 'share')
          .where('sid.sale_invoice_id = :invId', { invId: inv.si_id })
          .andWhere('sid.sale_order_id = :orderId', { orderId: order.id })
          .getRawOne()) as unknown as { share: string | null } | undefined;

        const orderShare = Number(orderShareResult?.share || 0);
        paidAmount += (orderShare / invTotal) * invPaid;
      }
    }
    order.paidAmount = paidAmount;

    if (order.totalCloseLine >= order.totalLine) {
      // Only complete if there are invoices and all are COMPLETED
      const allPaid =
        linkedInvoices.length > 0 &&
        linkedInvoices.every((inv) => Number(inv.si_status) === 3); // 3 = InvoiceStatus.COMPLETED

      if (allPaid) {
        order.status = OrderStatus.COMPLETED;
      } else {
        order.status = OrderStatus.PARTIAL;
      }
    } else if (order.totalCloseLine > 0) {
      order.status = OrderStatus.PARTIAL;
    } else {
      order.status = OrderStatus.PENDING;
    }

    await mgr.save(SaleOrder, order);
  }
}
