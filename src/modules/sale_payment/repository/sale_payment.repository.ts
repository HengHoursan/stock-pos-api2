import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SalePayment } from '../entity/sale_payment.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class SalePaymentRepository extends Repository<SalePayment> {
  constructor(private dataSource: DataSource) {
    super(SalePayment, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<SalePayment | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SalePayment[], number]> {
    const { page, limit, sortBy, sortOrder, search } = pagination;

    const queryBuilder = this.createQueryBuilder('sale_payment')
      .leftJoinAndSelect('sale_payment.customer', 'customer')
      .leftJoinAndSelect('sale_payment.details', 'details')
      .leftJoinAndSelect('details.saleInvoice', 'saleInvoice');

    if (search) {
      queryBuilder.andWhere(
        '(sale_payment.code ILIKE :search OR customer.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.') ? sortBy : `sale_payment.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('sale_payment.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
