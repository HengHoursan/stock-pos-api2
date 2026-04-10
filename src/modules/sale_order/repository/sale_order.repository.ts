import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { SaleOrder } from '../entity/sale_order.entity';
import { PaginationRequest } from '@/common/dto';

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
        queryBuilder.andWhere('sale_order.status = :status', { status: Number(filter.status) });
      }
      if (filter.customerId) {
        queryBuilder.andWhere('sale_order.customerId = :customerId', { customerId: Number(filter.customerId) });
      }
      
      // Business Date Range: orderDate
      if (filter.startDate) {
        queryBuilder.andWhere('sale_order.orderDate >= :startDate', { startDate: new Date(filter.startDate) });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('sale_order.orderDate <= :endDate', { endDate });
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.') ? sortBy : `sale_order.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('sale_order.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
