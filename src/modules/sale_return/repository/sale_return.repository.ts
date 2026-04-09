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
    const { page, limit, sortBy, sortOrder } = pagination;

    const queryBuilder = this.createQueryBuilder('sale_return')
      .leftJoinAndSelect('sale_return.customer', 'customer')
      .leftJoinAndSelect('sale_return.details', 'details')
      .leftJoinAndSelect('details.product', 'product');

    if (sortBy && sortOrder) {
      queryBuilder.orderBy(`sale_return.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('sale_return.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
