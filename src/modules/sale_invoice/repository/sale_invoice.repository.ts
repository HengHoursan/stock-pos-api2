import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere, EntityManager } from 'typeorm';
import { SaleInvoice } from '../entity/sale_invoice.entity';
import { PaginationRequest } from '@/common/dto';
import { InvoiceStatus } from '@/common/enum/invoice_status.enum';

@Injectable()
export class SaleInvoiceRepository extends Repository<SaleInvoice> {
  constructor(private dataSource: DataSource) {
    super(SaleInvoice, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<SaleInvoice | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleInvoice[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('sale_invoice')
      .leftJoinAndSelect('sale_invoice.customer', 'customer')
      .leftJoinAndSelect('sale_invoice.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .leftJoinAndSelect('details.saleOrder', 'saleOrder');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(sale_invoice.code ILIKE :search OR customer.name ILIKE :search OR sale_invoice.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        queryBuilder.andWhere('sale_invoice.status = :status', { status: Number(filter.status) });
      }
      if (filter.customerId) {
        queryBuilder.andWhere('sale_invoice.customerId = :customerId', { customerId: Number(filter.customerId) });
      }
      
      // Business Date Range: invoiceDate
      if (filter.startDate) {
        queryBuilder.andWhere('sale_invoice.invoiceDate >= :startDate', { startDate: new Date(filter.startDate) });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('sale_invoice.invoiceDate <= :endDate', { endDate });
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.') ? sortBy : `sale_invoice.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('sale_invoice.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }

  /**
   * Automatically heals invoice status based on payment amount.
   */
  async autoHealStatus(
    invoice: SaleInvoice,
    manager?: EntityManager,
  ): Promise<void> {
    const mgr = manager || this.manager;
    const currentInvoice = await mgr.findOne(SaleInvoice, {
      where: { id: invoice.id },
    });

    if (!currentInvoice) return;

    if (currentInvoice.isCancel) {
      currentInvoice.status = InvoiceStatus.CANCELLED;
    } else {
      const paidAmount = Number(currentInvoice.paidAmount || 0);
      const totalPrice = Number(currentInvoice.totalPrice || 0);

      if (paidAmount >= totalPrice && totalPrice > 0) {
        currentInvoice.status = InvoiceStatus.COMPLETED;
      } else if (paidAmount > 0) {
        currentInvoice.status = InvoiceStatus.CONFIRMED;
      } else {
        currentInvoice.status = InvoiceStatus.DRAFT;
      }
    }

    await mgr.save(SaleInvoice, currentInvoice);
    invoice.status = currentInvoice.status;
  }
}
