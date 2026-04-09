import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchaseReturn } from '../entity/purchase_return.entity';
import { PaginationRequest } from '../../../common/dto/request/pagination.request';

@Injectable()
export class PurchaseReturnRepository extends Repository<PurchaseReturn> {
  constructor(private dataSource: DataSource) {
    super(PurchaseReturn, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<PurchaseReturn | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseReturn[], number]> {
    const { page, limit, sortBy, sortOrder, search } = pagination;

    const queryBuilder = this.createQueryBuilder('purchase_return')
      .leftJoinAndSelect('purchase_return.supplier', 'supplier')
      .leftJoinAndSelect('purchase_return.details', 'details')
      .leftJoinAndSelect('details.product', 'product');

    if (search) {
      queryBuilder.andWhere(
        '(purchase_return.code ILIKE :search OR supplier.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.') ? sortBy : `purchase_return.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('purchase_return.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
