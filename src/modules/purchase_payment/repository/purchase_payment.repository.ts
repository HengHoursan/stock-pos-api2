import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchasePayment } from '../entity/purchase_payment.entity';
import { PaginationRequest } from '../../../common/dto/request/pagination.request';

@Injectable()
export class PurchasePaymentRepository extends Repository<PurchasePayment> {
  constructor(private dataSource: DataSource) {
    super(PurchasePayment, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<PurchasePayment | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchasePayment[], number]> {
    const { page, limit, sortBy, sortOrder } = pagination;

    const queryBuilder = this.createQueryBuilder('purchase_payment')
      .leftJoinAndSelect('purchase_payment.supplier', 'supplier')
      .leftJoinAndSelect('purchase_payment.details', 'details');

    if (sortBy && sortOrder) {
      queryBuilder.orderBy(`purchase_payment.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('purchase_payment.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
