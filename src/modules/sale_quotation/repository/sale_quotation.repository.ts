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
    const { page, limit, sortBy, sortOrder } = pagination;

    const queryBuilder = this.createQueryBuilder('sale_quotation')
      .leftJoinAndSelect('sale_quotation.customer', 'customer')
      .leftJoinAndSelect('sale_quotation.details', 'details')
      .leftJoinAndSelect('details.product', 'product');

    if (sortBy && sortOrder) {
      queryBuilder.orderBy(`sale_quotation.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('sale_quotation.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
