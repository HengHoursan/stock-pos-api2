import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SaleQuotation } from '../entity/sale_quotation.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class SaleQuotationRepository extends Repository<SaleQuotation> {
  constructor(private dataSource: DataSource) {
    super(SaleQuotation, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<SaleQuotation | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleQuotation[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('sale_quotation')
      .leftJoinAndSelect('sale_quotation.customer', 'customer')
      .leftJoinAndSelect('sale_quotation.details', 'details')
      .leftJoinAndSelect('details.product', 'product');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(sale_quotation.code ILIKE :search OR customer.name ILIKE :search OR sale_quotation.description ILIKE :search OR product.name ILIKE :search OR product.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        queryBuilder.andWhere('sale_quotation.status = :status', { status: Number(filter.status) });
      }
      if (filter.customerId) {
        queryBuilder.andWhere('sale_quotation.customerId = :customerId', { customerId: Number(filter.customerId) });
      }
      
      // Business Date Range: quotationDate
      if (filter.startDate) {
        queryBuilder.andWhere('sale_quotation.quotationDate >= :startDate', { startDate: new Date(filter.startDate) });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('sale_quotation.quotationDate <= :endDate', { endDate });
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.') ? sortBy : `sale_quotation.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('sale_quotation.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
