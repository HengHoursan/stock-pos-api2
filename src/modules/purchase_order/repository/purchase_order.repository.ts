import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
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
        '(purchase_order.code ILIKE :search OR supplier.name ILIKE :search OR purchase_order.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        queryBuilder.andWhere('purchase_order.status = :status', { status: Number(filter.status) });
      }
      if (filter.supplierId) {
        queryBuilder.andWhere('purchase_order.supplierId = :supplierId', { supplierId: Number(filter.supplierId) });
      }
      
      // Business Date Range: orderDate
      if (filter.startDate) {
        queryBuilder.andWhere('purchase_order.orderDate >= :startDate', { startDate: new Date(filter.startDate) });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('purchase_order.orderDate <= :endDate', { endDate });
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.') ? sortBy : `purchase_order.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
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
  async autoHealFulfillment(order: PurchaseOrder): Promise<void> {
    if (order.status === OrderStatus.COMPLETED || order.isCancel) return;

    const { PurchaseInvoiceDetail } = await import('../../purchase_invoice/entity/purchase_invoice_detail.entity.js');

    for (const orderDetail of order.details) {
      // Check if already linked
      const alreadyLinked = await this.manager.count(PurchaseInvoiceDetail, {
        where: { purchaseOrderDetailId: orderDetail.id }
      });

      if (alreadyLinked > 0) continue;

      // Try to find a match
      const orphanedMatch = await this.manager.createQueryBuilder(PurchaseInvoiceDetail, 'pid')
        .innerJoinAndSelect('pid.purchaseInvoice', 'pi')
        .where('pid.purchaseOrderId IS NULL')
        .andWhere('pi.supplierId = :supplierId', { supplierId: order.supplierId })
        .andWhere('pid.productId = :productId', { productId: orderDetail.productId })
        .andWhere('pid.quantity = :quantity', { quantity: orderDetail.quantity })
        .andWhere('pi.createdAt >= :orderDate', { orderDate: order.createdAt })
        .getOne();

      if (orphanedMatch) {
        orphanedMatch.purchaseOrderId = order.id;
        orphanedMatch.purchaseOrderDetailId = orderDetail.id;
        await this.manager.save(PurchaseInvoiceDetail, orphanedMatch);
        order.totalCloseLine = (order.totalCloseLine || 0) + 1;
      }
    }

    if (order.totalCloseLine >= order.totalLine) {
      order.status = OrderStatus.COMPLETED;
    } else if (order.totalCloseLine > 0) {
      order.status = OrderStatus.PARTIAL;
    }

    await this.manager.save(PurchaseOrder, order);
  }
}
