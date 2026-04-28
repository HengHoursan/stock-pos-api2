import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PurchaseReturn } from '../entity/purchase_return.entity';
import { PaginationRequest } from '@/common/dto';

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
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('purchase_return')
      .leftJoinAndSelect('purchase_return.supplier', 'supplier')
      .leftJoinAndSelect('purchase_return.purchaseInvoice', 'purchaseInvoice')
      .leftJoinAndSelect('purchase_return.details', 'details')
      .leftJoinAndSelect('details.product', 'product');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(purchase_return.code ILIKE :search OR supplier.name ILIKE :search OR purchase_return.description ILIKE :search OR product.name ILIKE :search OR product.code ILIKE :search OR purchaseInvoice.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        queryBuilder.andWhere('purchase_return.status = :status', { status: Number(filter.status) });
      }
      if (filter.supplierId) {
        queryBuilder.andWhere('purchase_return.supplierId = :supplierId', { supplierId: Number(filter.supplierId) });
      }
      
      // Business Date Range: returnDate
      if (filter.startDate) {
        queryBuilder.andWhere('purchase_return.returnDate >= :startDate', { startDate: new Date(filter.startDate) });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('purchase_return.returnDate <= :endDate', { endDate });
      }

      // Filter by Invoice ID if provided
      if (filter.purchaseInvoiceId) {
        queryBuilder.andWhere('purchase_return.purchaseInvoiceId = :purchaseInvoiceId', { purchaseInvoiceId: Number(filter.purchaseInvoiceId) });
      }
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
