import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaleInvoiceRepository } from '../repository/sale_invoice.repository';
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
import { OrderStatus } from '@/common/enum/order_status.enum';
import { PaymentMethod } from '@/common/enum/payment_method.enum';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class SaleInvoiceService {
  constructor(
    private readonly saleInvoiceRepository: SaleInvoiceRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateSaleInvoiceRequest,
    currentUserId: number | null = null,
  ): Promise<SaleInvoice> {
    const code = dto.code?.trim() || generateCode('SINV');

    const existingCode = await this.saleInvoiceRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(`Sale Invoice with code "${code}" already exists`);
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

          if (item.saleOrderId) {
            saleOrderIds.add(item.saleOrderId);
          }
        }
      }

      savedInvoice.totalPrice = totalPrice;
      await manager.save(SaleInvoice, savedInvoice);

      // Automatic Status Update
      await manager.withRepository(this.saleInvoiceRepository).autoHealStatus(savedInvoice);

      // Update Sale Order fulfillment
      for (const orderId of saleOrderIds) {
        const order = await manager.findOne(SaleOrder, { where: { id: orderId } });
        if (order) {
          const detailsForOrder = dto.details.filter(d => d.saleOrderId === orderId);
          order.totalCloseLine = (order.totalCloseLine || 0) + detailsForOrder.length;
          if (order.totalCloseLine >= order.totalLine) {
            order.status = OrderStatus.COMPLETED;
          } else if (order.totalCloseLine > 0) {
            order.status = OrderStatus.PARTIAL;
          }
          order.updatedBy = currentUserId;
          await manager.save(SaleOrder, order);
        }
      }

      return manager.findOne(SaleInvoice, {
        where: { id: savedInvoice.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleInvoice>;
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
      relations: ['customer', 'details', 'details.product'],
    });
    if (!invoice) {
      throw new NotFoundException(`Sale Invoice with id ${id} not found`);
    }
    return invoice;
  }

  async update(
    dto: UpdateSaleInvoiceRequest,
    currentUserId: number | null = null,
  ): Promise<SaleInvoice> {
    const invoice = await this.findOne(dto.id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Cannot edit a sale invoice that is not in DRAFT status');
    }

    if (dto.code && dto.code !== invoice.code) {
      const existing = await this.saleInvoiceRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Sale Invoice with code "${dto.code}" already exists`);
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) invoice.code = dto.code;
      if (dto.customerId) invoice.customerId = dto.customerId;
      if (dto.invoiceDate) invoice.invoiceDate = DateConvertor(dto.invoiceDate) || invoice.invoiceDate;
      if (dto.description !== undefined) invoice.description = dto.description;
      if (dto.paidAmount !== undefined) invoice.paidAmount = dto.paidAmount;
      if (dto.paymentMethod !== undefined) invoice.paymentMethod = dto.paymentMethod;
      invoice.updatedBy = currentUserId;

      if (dto.details) {
        await manager.delete(SaleInvoiceDetail, { saleInvoiceId: invoice.id });

        let totalPrice = 0;
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
        }

        invoice.totalLine = dto.details.length;
        invoice.totalPrice = totalPrice;
      }

      await manager.save(SaleInvoice, invoice);

      // Automatic Status Update
      await manager.withRepository(this.saleInvoiceRepository).autoHealStatus(invoice);

      return manager.findOne(SaleInvoice, {
        where: { id: invoice.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleInvoice>;
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
    if (invoice.status === InvoiceStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed sale invoice');
    }

    return await this.dataSource.transaction(async (manager) => {
      invoice.isCancel = true;
      invoice.status = InvoiceStatus.CANCELLED;
      invoice.updatedBy = currentUserId;

      // Reverse Sale Order fulfillment
      const saleOrderIds = new Set<number>();
      for (const detail of invoice.details) {
        if (detail.saleOrderId) {
          saleOrderIds.add(detail.saleOrderId);
        }
      }

      for (const orderId of saleOrderIds) {
        const order = await manager.findOne(SaleOrder, { where: { id: orderId } });
        if (order) {
          const detailsForOrder = invoice.details.filter(d => d.saleOrderId === orderId);
          order.totalCloseLine = Math.max(0, (order.totalCloseLine || 0) - detailsForOrder.length);
          if (order.totalCloseLine === 0) {
            order.status = OrderStatus.PENDING;
          } else if (order.totalCloseLine < order.totalLine) {
            order.status = OrderStatus.PARTIAL;
          }
          order.updatedBy = currentUserId;
          await manager.save(SaleOrder, order);
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
    const invoice = await this.findOne(id);
    invoice.deletedBy = currentUserId;
    await this.saleInvoiceRepository.save(invoice);
    await this.saleInvoiceRepository.softRemove(invoice);
  }

  async forceDelete(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(SaleInvoiceDetail, { saleInvoiceId: id });
      await manager.delete(SaleInvoice, id);
    });
  }
}
