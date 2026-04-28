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
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('sale_payment')
      .leftJoinAndSelect('sale_payment.customer', 'customer')
      .leftJoinAndSelect('sale_payment.details', 'details')
      .leftJoinAndSelect('details.saleInvoice', 'saleInvoice');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(sale_payment.code ILIKE :search OR customer.name ILIKE :search OR sale_payment.description ILIKE :search OR saleInvoice.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        // SalePayment doesn't have status in entity yet, but we'll add logic for future proofing
        // queryBuilder.andWhere('sale_payment.status = :status', { status: Number(filter.status) });
      }
      if (filter.customerId) {
        queryBuilder.andWhere('sale_payment.customerId = :customerId', { customerId: Number(filter.customerId) });
      }
      
      // Business Date Range: paymentDate
      if (filter.startDate) {
        queryBuilder.andWhere('sale_payment.paymentDate >= :startDate', { startDate: new Date(filter.startDate) });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('sale_payment.paymentDate <= :endDate', { endDate });
      }

      // Filter by Invoice ID if provided
      if (filter.invoiceId) {
        queryBuilder.andWhere('details.saleInvoiceId = :invoiceId', { invoiceId: Number(filter.invoiceId) });
      }
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
