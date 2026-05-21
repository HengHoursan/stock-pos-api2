import { Injectable } from '@nestjs/common';
import {
  DataSource,
  Repository,
  ILike,
  FindOptionsWhere,
  EntityManager,
} from 'typeorm';
import { PurchaseInvoice } from '../entity/purchase_invoice.entity';
import { PaginationRequest } from '@/common/dto';
import { InvoiceStatus } from '@/common/enum/invoice_status.enum';

@Injectable()
export class PurchaseInvoiceRepository extends Repository<PurchaseInvoice> {
  constructor(private dataSource: DataSource) {
    super(PurchaseInvoice, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<PurchaseInvoice | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseInvoice[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('purchase_invoice')
      .leftJoinAndSelect('purchase_invoice.supplier', 'supplier')
      .leftJoinAndSelect('purchase_invoice.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .leftJoinAndSelect('details.purchaseOrder', 'purchaseOrder');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(purchase_invoice.code ILIKE :search OR supplier.name ILIKE :search OR purchase_invoice.description ILIKE :search OR product.name ILIKE :search OR product.code ILIKE :search OR purchaseOrder.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      if (filter.status && filter.status !== 'all') {
        queryBuilder.andWhere('purchase_invoice.status = :status', {
          status: Number(filter.status),
        });
      }
      if (filter.supplierId) {
        queryBuilder.andWhere('purchase_invoice.supplierId = :supplierId', {
          supplierId: Number(filter.supplierId),
        });
      }

      // Business Date Range: invoiceDate
      if (filter.startDate) {
        queryBuilder.andWhere('purchase_invoice.invoiceDate >= :startDate', {
          startDate: new Date(filter.startDate),
        });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('purchase_invoice.invoiceDate <= :endDate', {
          endDate,
        });
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.')
        ? sortBy
        : `purchase_invoice.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder);
    } else {
      queryBuilder.orderBy('purchase_invoice.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }

  /**
   * Automatically heals invoice status based on payment amount.
   */
  async autoHealStatus(
    invoice: PurchaseInvoice,
    manager?: EntityManager,
  ): Promise<void> {
    const mgr = manager || this.manager;
    const currentInvoice = await mgr.findOne(PurchaseInvoice, {
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

    await mgr.save(PurchaseInvoice, currentInvoice);
    invoice.status = currentInvoice.status;
  }
}
