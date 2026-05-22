import { Injectable } from '@nestjs/common';
import {
  DataSource,
  Repository,
  ILike,
  FindOptionsWhere,
  EntityManager,
} from 'typeorm';
import { PurchaseOrder } from '../entity/purchase_order.entity';
import { PaginationRequest } from '@/common/dto';
import { OrderStatus } from '@/common/enum/order_status.enum';

@Injectable()
export class PurchaseOrderRepository extends Repository<PurchaseOrder> {
  constructor(private dataSource: DataSource) {
    super(PurchaseOrder, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<PurchaseOrder | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseOrder[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('purchase_order')
      .leftJoinAndSelect('purchase_order.supplier', 'supplier')
      .leftJoinAndSelect('purchase_order.details', 'details')
      .leftJoinAndSelect('details.product', 'product');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(purchase_order.code ILIKE :search OR supplier.name ILIKE :search OR purchase_order.description ILIKE :search OR product.name ILIKE :search OR product.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        queryBuilder.andWhere('purchase_order.status = :status', {
          status: Number(filter.status),
        });
      }
      if (filter.supplierId) {
        queryBuilder.andWhere('purchase_order.supplierId = :supplierId', {
          supplierId: Number(filter.supplierId),
        });
      }

      // Business Date Range: orderDate
      if (filter.startDate) {
        queryBuilder.andWhere('purchase_order.orderDate >= :startDate', {
          startDate: new Date(filter.startDate),
        });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('purchase_order.orderDate <= :endDate', {
          endDate,
        });
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.')
        ? sortBy
        : `purchase_order.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder);
    } else {
      queryBuilder.orderBy('purchase_order.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }

  /**
   * Automatically heals orphaned fulfillment links.
   * Scans for invoices that should belong to this order but are missing the link.
   */
  async autoHealFulfillment(
    order: PurchaseOrder,
    manager?: EntityManager,
  ): Promise<void> {
    const mgr = manager || this.manager;
    if (order.isCancel) return;

    const { PurchaseInvoiceDetail } =
      await import('../../purchase_invoice/entity/purchase_invoice_detail.entity.js');

    const { PurchaseInvoice } =
      await import('../../purchase_invoice/entity/purchase_invoice.entity.js');

    order.totalLine = order.details?.length || 0;
    order.totalCloseLine = 0;

    for (const orderDetail of order.details) {
      const result = (await mgr
        .createQueryBuilder(PurchaseInvoiceDetail, 'pid')
        .innerJoin('pid.purchaseInvoice', 'pi')
        .select('SUM(pid.quantity)', 'totalInvoiced')
        .where('pid.purchase_order_detail_id = :detailId', {
          detailId: orderDetail.id,
        })
        .andWhere('pi.isCancel = false')
        .getRawOne()) as unknown as
        | { totalInvoiced: string | null }
        | undefined;

      const totalInvoiced = Number(result?.totalInvoiced || 0);

      if (totalInvoiced >= Number(orderDetail.quantity)) {
        order.totalCloseLine = (order.totalCloseLine || 0) + 1;
        continue;
      }

      const remainingQty = Number(orderDetail.quantity) - totalInvoiced;

      // Try to find a match
      const orphanedMatch = await mgr
        .createQueryBuilder(PurchaseInvoiceDetail, 'pid')
        .innerJoinAndSelect('pid.purchaseInvoice', 'pi')
        .where('pid.purchaseOrderId IS NULL')
        .andWhere('pi.supplierId = :supplierId', {
          supplierId: order.supplierId,
        })
        .andWhere('pi.isCancel = false')
        .andWhere('pid.productId = :productId', {
          productId: orderDetail.productId,
        })
        .andWhere('pid.quantity = :quantity', {
          quantity: remainingQty,
        })
        .andWhere('pi.createdAt >= :orderDate', { orderDate: order.createdAt })
        .getOne();

      if (orphanedMatch) {
        orphanedMatch.purchaseOrderId = order.id;
        orphanedMatch.purchaseOrderDetailId = orderDetail.id;
        await mgr.save(PurchaseInvoiceDetail, orphanedMatch);
        order.totalCloseLine = (order.totalCloseLine || 0) + 1;
      }
    }

    // Determine Status based on payment of linked invoices
    const linkedInvoices = (await mgr
      .createQueryBuilder(PurchaseInvoice, 'pi')
      .innerJoin(
        'purchase_invoice_details',
        'pid',
        'pid.purchase_invoice_id = pi.id',
      )
      .where('pid.purchase_order_id = :orderId', { orderId: order.id })
      .andWhere('pi.is_cancel = false')
      .select(['pi.id', 'pi.status', 'pi.total_price', 'pi.paid_amount'])
      .distinct(true)
      .getRawMany()) as unknown as Array<{
      pi_id: number;
      pi_status: number;
      pi_total_price: string;
      pi_paid_amount: string;
    }>;

    if (order.totalCloseLine >= order.totalLine) {
      const allPaid =
        linkedInvoices.length > 0 &&
        linkedInvoices.every((inv) => Number(inv.pi_status) === 3); // 3 = InvoiceStatus.COMPLETED

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

    await mgr.save(PurchaseOrder, order);
  }
}
