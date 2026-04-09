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
    const { page, limit, sortBy, sortOrder, search } = pagination;

    const queryBuilder = this.createQueryBuilder('purchase_payment')
      .leftJoinAndSelect('purchase_payment.supplier', 'supplier')
      .leftJoinAndSelect('purchase_payment.details', 'details')
      .leftJoinAndSelect('details.purchaseInvoice', 'purchaseInvoice');

    if (search) {
      queryBuilder.andWhere(
        '(purchase_payment.code ILIKE :search OR supplier.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.') ? sortBy : `purchase_payment.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('purchase_payment.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
