import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchasePayment } from '../entity/purchase_payment.entity';
import { PaginationRequest } from '@/common/dto';

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
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('purchase_payment')
      .leftJoinAndSelect('purchase_payment.supplier', 'supplier')
      .leftJoinAndSelect('purchase_payment.details', 'details')
      .leftJoinAndSelect('details.purchaseInvoice', 'purchaseInvoice');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(purchase_payment.code ILIKE :search OR supplier.name ILIKE :search OR purchase_payment.description ILIKE :search OR purchaseInvoice.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.supplierId) {
        queryBuilder.andWhere('purchase_payment.supplierId = :supplierId', {
          supplierId: Number(filter.supplierId),
        });
      }

      // Business Date Range: paymentDate
      if (filter.startDate) {
        queryBuilder.andWhere('purchase_payment.paymentDate >= :startDate', {
          startDate: new Date(filter.startDate),
        });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('purchase_payment.paymentDate <= :endDate', {
          endDate,
        });
      }

      // Filter by Invoice ID if provided
      if (filter.purchaseInvoiceId) {
        queryBuilder.andWhere(
          'details.purchaseInvoiceId = :purchaseInvoiceId',
          { purchaseInvoiceId: Number(filter.purchaseInvoiceId) },
        );
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.')
        ? sortBy
        : `purchase_payment.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder);
    } else {
      queryBuilder.orderBy('purchase_payment.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
