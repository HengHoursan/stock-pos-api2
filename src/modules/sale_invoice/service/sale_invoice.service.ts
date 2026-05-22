import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaleInvoiceRepository } from '../repository/sale_invoice.repository';
import {
  StockService,
  LowStockWarning,
} from '../../product/service/stock.service';
import { Product } from '../../product/entity/product.entity';
import { SaleOrderRepository } from '../../sale_order/repository/sale_order.repository';
import {
  CreateSaleInvoiceRequest,
  UpdateSaleInvoiceRequest,
  UpdateSaleInvoiceStatusRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { SaleInvoice } from '../entity/sale_invoice.entity';
import { SaleInvoiceDetail } from '../entity/sale_invoice_detail.entity';
import { SaleOrder } from '../../sale_order/entity/sale_order.entity';
import { InvoiceStatus } from '@/common/enum/invoice_status.enum';
import { PaymentMethod } from '@/common/enum/payment_method.enum';
import { generateCode, DateConvertor } from '@/common/util/helper';

export interface SaleInvoiceCreateResult {
  invoice: SaleInvoice;
  lowStockWarnings: LowStockWarning[];
}

@Injectable()
export class SaleInvoiceService {
  constructor(
    private readonly saleInvoiceRepository: SaleInvoiceRepository,
    private readonly saleOrderRepository: SaleOrderRepository,
    private readonly stockService: StockService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateSaleInvoiceRequest,
    currentUserId: number | null = null,
  ): Promise<SaleInvoiceCreateResult> {
    const code = dto.code?.trim() || generateCode('SINV');

    const existingCode = await this.saleInvoiceRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(
        `Sale Invoice with code "${code}" already exists`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const invoice = manager.create(SaleInvoice, {
        code,
        customerId: dto.customerId,
        invoiceDate: DateConvertor(dto.invoiceDate) || new Date(),
        description: dto.description,
        paidAmount: dto.paidAmount || 0,
        paymentMethod: dto.paymentMethod || PaymentMethod.CASH,
        status: InvoiceStatus.DRAFT,
        isCancel: false,
        totalLine: dto.details?.length || 0,
        totalPrice: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedInvoice = await manager.save(SaleInvoice, invoice);

      let totalPrice = 0;
      const saleOrderIds = new Set<number>();
      const lowStockWarnings: LowStockWarning[] = [];

      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(SaleInvoiceDetail, {
            saleInvoiceId: savedInvoice.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            saleOrderId: item.saleOrderId || null,
            saleOrderDetailId: item.saleOrderDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(SaleInvoiceDetail, detail);
          totalPrice += Number(item.totalPrice);

          // Stock OUT — throws BadRequestException if insufficient
          const { isLowStock, afterStock } =
            await this.stockService.adjustStock(
              manager,
              item.productId,
              item.quantity,
              'OUT',
              `Sale Invoice: ${code}`,
              currentUserId,
              DateConvertor(dto.invoiceDate) || new Date(),
            );

          if (isLowStock) {
            const prod = await manager.findOne(Product, {
              where: { id: item.productId },
            });
            lowStockWarnings.push({
              productId: item.productId,
              productCode: prod?.code ?? '',
              productName: prod?.name ?? '',
              afterStock,
              alertQuantity: Number(prod?.alertQuantity ?? 0),
            });
          }

          if (item.saleOrderId) {
            saleOrderIds.add(item.saleOrderId);
          }
        }
      }

      savedInvoice.totalPrice = totalPrice;
      await manager.save(SaleInvoice, savedInvoice);

      await this.saleInvoiceRepository.autoHealStatus(savedInvoice, manager);

      for (const orderId of saleOrderIds) {
        const order = await manager.findOne(SaleOrder, {
          where: { id: orderId },
          relations: ['details'],
        });
        if (order) {
          await this.saleOrderRepository.autoHealFulfillment(order, manager);
        }
      }

      const result = (await manager.findOne(SaleInvoice, {
        where: { id: savedInvoice.id },
        relations: ['customer', 'details', 'details.product'],
      })) as SaleInvoice;

      return { invoice: result, lowStockWarnings };
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleInvoice[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.saleInvoiceRepository.findAllWithPagination(pagination);
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<SaleInvoice[]> {
    return this.saleInvoiceRepository.find({
      relations: ['customer', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SaleInvoice> {
    const invoice = await this.saleInvoiceRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'details',
        'details.product',
        'details.saleOrder',
      ],
    });
    if (!invoice) {
      throw new NotFoundException(`Sale Invoice with id ${id} not found`);
    }
    return invoice;
  }

  async update(
    dto: UpdateSaleInvoiceRequest,
    currentUserId: number | null = null,
  ): Promise<SaleInvoiceCreateResult> {
    const invoice = await this.findOne(dto.id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot edit a sale invoice that is not in DRAFT status',
      );
    }

    if (dto.code && dto.code !== invoice.code) {
      const existing = await this.saleInvoiceRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(
          `Sale Invoice with code "${dto.code}" already exists`,
        );
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) invoice.code = dto.code;
      if (dto.customerId) invoice.customerId = dto.customerId;
      if (dto.invoiceDate)
        invoice.invoiceDate =
          DateConvertor(dto.invoiceDate) || invoice.invoiceDate;
      if (dto.description !== undefined) invoice.description = dto.description;
      if (dto.paidAmount !== undefined) invoice.paidAmount = dto.paidAmount;
      if (dto.paymentMethod !== undefined)
        invoice.paymentMethod = dto.paymentMethod;
      invoice.updatedBy = currentUserId;

      const lowStockWarnings: LowStockWarning[] = [];

      if (dto.details) {
        // Reverse stock for old details (IN — undo the original OUT)
        for (const oldDetail of invoice.details) {
          await this.stockService.adjustStock(
            manager,
            oldDetail.productId,
            oldDetail.quantity,
            'IN',
            `Reversed - Sale Invoice Update: ${invoice.code}`,
            currentUserId,
          );
        }

        // Reverse Sale Order fulfillment amounts
        const oldSaleOrderIds = new Set<number>();
        for (const oldDetail of invoice.details) {
          if (oldDetail.saleOrderId) oldSaleOrderIds.add(oldDetail.saleOrderId);
        }
        for (const orderId of oldSaleOrderIds) {
          const order = await manager.findOne(SaleOrder, {
            where: { id: orderId },
            relations: ['details'],
          });
          if (order) {
            await this.saleOrderRepository.autoHealFulfillment(order, manager);
          }
        }

        await manager.delete(SaleInvoiceDetail, { saleInvoiceId: invoice.id });

        let totalPrice = 0;
        const newSaleOrderIds = new Set<number>();
        for (const item of dto.details) {
          const detail = manager.create(SaleInvoiceDetail, {
            saleInvoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            saleOrderId: item.saleOrderId || null,
            saleOrderDetailId: item.saleOrderDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(SaleInvoiceDetail, detail);
          totalPrice += Number(item.totalPrice);
          if (item.saleOrderId) newSaleOrderIds.add(item.saleOrderId);

          // Stock OUT for new details — throws if insufficient
          const { isLowStock, afterStock } =
            await this.stockService.adjustStock(
              manager,
              item.productId,
              item.quantity,
              'OUT',
              `Sale Invoice Update: ${invoice.code}`,
              currentUserId,
              (dto.invoiceDate ? DateConvertor(dto.invoiceDate) : null) ??
                invoice.invoiceDate,
            );

          if (isLowStock) {
            const prod = await manager.findOne(Product, {
              where: { id: item.productId },
            });
            lowStockWarnings.push({
              productId: item.productId,
              productCode: prod?.code ?? '',
              productName: prod?.name ?? '',
              afterStock,
              alertQuantity: Number(prod?.alertQuantity ?? 0),
            });
          }
        }

        invoice.totalLine = dto.details.length;
        invoice.totalPrice = totalPrice;

        for (const orderId of newSaleOrderIds) {
          const order = await manager.findOne(SaleOrder, {
            where: { id: orderId },
            relations: ['details'],
          });
          if (order) {
            await this.saleOrderRepository.autoHealFulfillment(order, manager);
          }
        }
      }

      await manager.save(SaleInvoice, invoice);
      await this.saleInvoiceRepository.autoHealStatus(invoice, manager);

      const updated = (await manager.findOne(SaleInvoice, {
        where: { id: invoice.id },
        relations: [
          'customer',
          'details',
          'details.product',
          'details.saleOrder',
        ],
      })) as SaleInvoice;

      return { invoice: updated, lowStockWarnings };
    });
  }

  async updateStatus(
    dto: UpdateSaleInvoiceStatusRequest,
    currentUserId: number | null = null,
  ): Promise<SaleInvoice> {
    const invoice = await this.findOne(dto.id);
    invoice.status = dto.status;
    if (dto.status === InvoiceStatus.CANCELLED) {
      invoice.isCancel = true;
    }
    invoice.updatedBy = currentUserId;
    return this.saleInvoiceRepository.save(invoice);
  }

  async cancel(
    id: number,
    currentUserId: number | null = null,
  ): Promise<SaleInvoice> {
    const invoice = await this.findOne(id);
    if (invoice.isCancel) return invoice;

    return await this.dataSource.transaction(async (manager) => {
      invoice.isCancel = true;
      invoice.status = InvoiceStatus.CANCELLED;
      invoice.updatedBy = currentUserId;

      // Restore stock for each detail (IN — undo the original sale OUT)
      for (const detail of invoice.details) {
        await this.stockService.adjustStock(
          manager,
          detail.productId,
          detail.quantity,
          'IN',
          `Cancelled - Sale Invoice: ${invoice.code}`,
          currentUserId,
        );
      }

      // Reverse Sale Order fulfillment counts
      const saleOrderIds = new Set<number>();
      for (const detail of invoice.details) {
        if (detail.saleOrderId) saleOrderIds.add(detail.saleOrderId);
      }

      for (const orderId of saleOrderIds) {
        const order = await manager.findOne(SaleOrder, {
          where: { id: orderId },
          relations: ['details'],
        });
        if (order) {
          await this.saleOrderRepository.autoHealFulfillment(order, manager);
        }
      }

      await manager.save(SaleInvoice, invoice);
      return invoice;
    });
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    let invoice = await this.findOne(id);
    if (!invoice.isCancel) {
      invoice = await this.cancel(id, currentUserId);
    }
    invoice.deletedBy = currentUserId;
    await this.saleInvoiceRepository.save(invoice);
    await this.saleInvoiceRepository.softRemove(invoice);
  }

  async forceDelete(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    if (!invoice.isCancel) {
      await this.cancel(id, null);
    }
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(SaleInvoiceDetail, { saleInvoiceId: id });
      await manager.delete(SaleInvoice, id);
    });
  }

  async bulkUpdateStatus(
    ids: number[],
    status: InvoiceStatus,
    currentUserId: number | null = null,
  ): Promise<void> {
    if (status === InvoiceStatus.CANCELLED) {
      for (const id of ids) {
        await this.cancel(id, currentUserId);
      }
      return;
    }

    await this.saleInvoiceRepository.update(ids, {
      status,
      updatedBy: currentUserId,
    });
  }
}
