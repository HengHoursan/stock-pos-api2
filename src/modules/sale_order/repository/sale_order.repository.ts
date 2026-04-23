import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { SaleOrder } from '../entity/sale_order.entity';
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
        '(sale_order.code ILIKE :search OR customer.name ILIKE :search OR sale_order.description ILIKE :search)',
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
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
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
  async autoHealFulfillment(order: SaleOrder): Promise<void> {
    if (order.status === OrderStatus.COMPLETED || order.isCancel) return;

    const { SaleInvoiceDetail } =
      await import('../../sale_invoice/entity/sale_invoice_detail.entity.js');

    for (const orderDetail of order.details) {
      // Check if already linked
      const alreadyLinked = await this.manager.count(SaleInvoiceDetail, {
        where: { saleOrderDetailId: orderDetail.id },
      });

      if (alreadyLinked > 0) continue;

      // Try to find a match
      const orphanedMatch = await this.manager
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
          quantity: orderDetail.quantity,
        })
        .andWhere('si.createdAt >= :orderDate', { orderDate: order.createdAt })
        .getOne();

      if (orphanedMatch) {
        orphanedMatch.saleOrderId = order.id;
        orphanedMatch.saleOrderDetailId = orderDetail.id;
        await this.manager.save(SaleInvoiceDetail, orphanedMatch);
        order.totalCloseLine = (order.totalCloseLine || 0) + 1;
      }
    }

    if (order.totalCloseLine >= order.totalLine) {
      order.status = OrderStatus.COMPLETED;
    } else if (order.totalCloseLine > 0) {
      order.status = OrderStatus.PARTIAL;
    }

    await this.manager.save(SaleOrder, order);
  }
}
