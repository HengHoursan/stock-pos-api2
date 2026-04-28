import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SaleReturn } from '../entity/sale_return.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class SaleReturnRepository extends Repository<SaleReturn> {
  constructor(private dataSource: DataSource) {
    super(SaleReturn, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<SaleReturn | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleReturn[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('sale_return')
      .leftJoinAndSelect('sale_return.customer', 'customer')
      .leftJoinAndSelect('sale_return.saleInvoice', 'saleInvoice')
      .leftJoinAndSelect('sale_return.details', 'details')
      .leftJoinAndSelect('details.product', 'product');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(sale_return.code ILIKE :search OR customer.name ILIKE :search OR sale_return.description ILIKE :search OR product.name ILIKE :search OR product.code ILIKE :search OR saleInvoice.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        queryBuilder.andWhere('sale_return.status = :status', { status: Number(filter.status) });
      }
      if (filter.customerId) {
        queryBuilder.andWhere('sale_return.customerId = :customerId', { customerId: Number(filter.customerId) });
      }
      
      // Business Date Range: returnDate
      if (filter.startDate) {
        queryBuilder.andWhere('sale_return.returnDate >= :startDate', { startDate: new Date(filter.startDate) });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('sale_return.returnDate <= :endDate', { endDate });
      }

      // Filter by Invoice ID if provided
      if (filter.saleInvoiceId) {
        queryBuilder.andWhere('sale_return.saleInvoiceId = :saleInvoiceId', { saleInvoiceId: Number(filter.saleInvoiceId) });
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.') ? sortBy : `sale_return.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('sale_return.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
