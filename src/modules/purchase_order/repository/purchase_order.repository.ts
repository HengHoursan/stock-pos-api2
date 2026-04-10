import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { PurchaseOrder } from '../entity/purchase_order.entity';
import { PaginationRequest } from '@/common/dto';

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
}
