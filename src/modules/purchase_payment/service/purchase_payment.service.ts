import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PurchasePaymentRepository } from '../repository/purchase_payment.repository';
import { PurchaseInvoice } from '../../purchase_invoice/entity/purchase_invoice.entity';
import {
  CreatePurchasePaymentRequest,
  UpdatePurchasePaymentRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '../../../common/dto';
import { PurchasePayment } from '../entity/purchase_payment.entity';
import { PurchasePaymentDetail } from '../entity/purchase_payment_detail.entity';
import { PurchaseOrderRepository } from '@/purchase_order/repository/purchase_order.repository';
import { PurchaseOrder } from '@/purchase_order/entity/purchase_order.entity';
import { PurchaseInvoiceRepository } from '@/purchase_invoice/repository/purchase_invoice.repository';
import { generateCode, DateConvertor } from '../../../common/util/helper';

@Injectable()
export class PurchasePaymentService {
  constructor(
    private readonly purchasePaymentRepository: PurchasePaymentRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly purchaseInvoiceRepository: PurchaseInvoiceRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreatePurchasePaymentRequest,
    currentUserId: number | null = null,
  ): Promise<PurchasePayment> {
    const code = dto.code?.trim() || generateCode('PPAY');

    const existingCode = await this.purchasePaymentRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(`Purchase Payment with code "${code}" already exists`);
    }

    return await this.dataSource.transaction(async (manager) => {
      const payment = manager.create(PurchasePayment, {
        code,
        supplierId: dto.supplierId,
        paymentDate: DateConvertor(dto.paymentDate) || new Date(),
        description: dto.description,
        paidAmount: dto.paidAmount || 0, // This is just recording how much cash was given
        isCancel: false,
        totalPrice: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedPayment = await manager.save(PurchasePayment, payment);

      let totalPrice = 0;
      const purchaseInvoiceIds = new Set<number>();

      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(PurchasePaymentDetail, {
            purchasePaymentId: savedPayment.id,
            totalPrice: item.totalPrice,
            purchaseInvoiceId: item.purchaseInvoiceId || null,
            purchaseInvoiceDetailId: item.purchaseInvoiceDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchasePaymentDetail, detail);
          totalPrice += Number(item.totalPrice);

          if (item.purchaseInvoiceId) {
            purchaseInvoiceIds.add(item.purchaseInvoiceId);
            
            // Adjust invoice paidAmount
            const invoice = await manager.findOne(PurchaseInvoice, { where: { id: item.purchaseInvoiceId } });
            if (invoice) {
              invoice.paidAmount = Number(invoice.paidAmount || 0) + Number(item.totalPrice);
              
              invoice.updatedBy = currentUserId;
              await manager.save(PurchaseInvoice, invoice);
              
              // Automatic Status Update
              await this.purchaseInvoiceRepository.autoHealStatus(invoice, manager);

              // Trigger Order Healing
              const invoiceDetails = await manager.createQueryBuilder('purchase_invoice_details', 'pid')
                .where('pid.purchase_invoice_id = :invoiceId', { invoiceId: invoice.id })
                .andWhere('pid.purchase_order_id IS NOT NULL')
                .getRawMany();

              const orderIds = [...new Set(invoiceDetails.map(d => d.purchase_order_id))];
              for (const orderId of orderIds) {
                const order = await manager.findOne(PurchaseOrder, { 
                  where: { id: orderId },
                  relations: ['details'] 
                });
                if (order) {
                  await this.purchaseOrderRepository.autoHealFulfillment(order, manager);
                }
              }
            }
          }
        }
      }

      savedPayment.totalPrice = totalPrice;
      if (!dto.paidAmount) {
         savedPayment.paidAmount = totalPrice;
      }
      await manager.save(PurchasePayment, savedPayment);

      return manager.findOne(PurchasePayment, {
        where: { id: savedPayment.id },
        relations: ['supplier', 'details', 'details.purchaseInvoice'],
      }) as Promise<PurchasePayment>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchasePayment[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.purchasePaymentRepository.findAllWithPagination(pagination);
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<PurchasePayment[]> {
    return this.purchasePaymentRepository.find({
      relations: ['supplier', 'details', 'details.purchaseInvoice'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PurchasePayment> {
    const payment = await this.purchasePaymentRepository.findOne({
      where: { id },
      relations: ['supplier', 'details', 'details.purchaseInvoice'],
    });
    if (!payment) {
      throw new NotFoundException(`Purchase Payment with id ${id} not found`);
    }
    return payment;
  }

  async update(
    dto: UpdatePurchasePaymentRequest,
    currentUserId: number | null = null,
  ): Promise<PurchasePayment> {
    const payment = await this.findOne(dto.id!);

    if (payment.isCancel) {
      throw new BadRequestException('Cannot edit a cancelled purchase payment');
    }

    if (dto.code && dto.code !== payment.code) {
      const existing = await this.purchasePaymentRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Purchase Payment with code "${dto.code}" already exists`);
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) payment.code = dto.code;
      if (dto.supplierId) payment.supplierId = dto.supplierId;
      if (dto.paymentDate) payment.paymentDate = DateConvertor(dto.paymentDate) || payment.paymentDate;
      if (dto.description !== undefined) payment.description = dto.description;
      if (dto.paidAmount !== undefined) payment.paidAmount = dto.paidAmount;
      payment.updatedBy = currentUserId;

      if (dto.details) {
        // Reverse old payment applications
        for (const oldDetail of payment.details) {
          if (oldDetail.purchaseInvoiceId) {
             const invoice = await manager.findOne(PurchaseInvoice, { where: { id: oldDetail.purchaseInvoiceId } });
             if (invoice) {
               invoice.paidAmount = Math.max(0, Number(invoice.paidAmount) - Number(oldDetail.totalPrice));
               invoice.updatedBy = currentUserId;
               await manager.save(PurchaseInvoice, invoice);

               // Re-evaluate status
               await this.purchaseInvoiceRepository.autoHealStatus(invoice, manager);

               // Trigger Order Healing
               const invoiceDetails = await manager.createQueryBuilder('purchase_invoice_details', 'pid')
                 .where('pid.purchase_invoice_id = :invoiceId', { invoiceId: invoice.id })
                 .andWhere('pid.purchase_order_id IS NOT NULL')
                 .getRawMany();

               const orderIds = [...new Set(invoiceDetails.map(d => d.purchase_order_id))];
               for (const orderId of orderIds) {
                 const order = await manager.findOne(PurchaseOrder, { 
                   where: { id: orderId },
                   relations: ['details'] 
                 });
                 if (order) {
                   await this.purchaseOrderRepository.autoHealFulfillment(order, manager);
                 }
               }
             }
          }
        }
        await manager.delete(PurchasePaymentDetail, { purchasePaymentId: payment.id });

        let totalPrice = 0;
        for (const item of dto.details) {
          const detail = manager.create(PurchasePaymentDetail, {
            purchasePaymentId: payment.id,
            totalPrice: item.totalPrice,
            purchaseInvoiceId: item.purchaseInvoiceId || null,
            purchaseInvoiceDetailId: item.purchaseInvoiceDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchasePaymentDetail, detail);
          totalPrice += Number(item.totalPrice);

          if (item.purchaseInvoiceId) {
            // Apply new payment
            const invoice = await manager.findOne(PurchaseInvoice, { where: { id: item.purchaseInvoiceId } });
            if (invoice) {
               invoice.paidAmount = Number(invoice.paidAmount || 0) + Number(item.totalPrice);
               invoice.updatedBy = currentUserId;
               await manager.save(PurchaseInvoice, invoice);

               // Re-evaluate status
               await this.purchaseInvoiceRepository.autoHealStatus(invoice, manager);

               // Trigger Order Healing
               const invoiceDetails = await manager.createQueryBuilder('purchase_invoice_details', 'pid')
                 .where('pid.purchase_invoice_id = :invoiceId', { invoiceId: invoice.id })
                 .andWhere('pid.purchase_order_id IS NOT NULL')
                 .getRawMany();

               const orderIds = [...new Set(invoiceDetails.map(d => d.purchase_order_id))];
               for (const orderId of orderIds) {
                 const order = await manager.findOne(PurchaseOrder, { 
                   where: { id: orderId },
                   relations: ['details'] 
                 });
                 if (order) {
                   await this.purchaseOrderRepository.autoHealFulfillment(order, manager);
                 }
               }
            }
          }
        }
        payment.totalPrice = totalPrice;
      }

      await manager.save(PurchasePayment, payment);

      return manager.findOne(PurchasePayment, {
        where: { id: payment.id },
        relations: ['supplier', 'details', 'details.purchaseInvoice'],
      }) as Promise<PurchasePayment>;
    });
  }

  async cancel(
    id: number,
    currentUserId: number | null = null,
  ): Promise<PurchasePayment> {
    const payment = await this.findOne(id);

    return await this.dataSource.transaction(async (manager) => {
      payment.isCancel = true;
      payment.updatedBy = currentUserId;

      // Reverse applied payments to invoices
      for (const detail of payment.details) {
         if (detail.purchaseInvoiceId) {
            const invoice = await manager.findOne(PurchaseInvoice, { where: { id: detail.purchaseInvoiceId } });
            if (invoice) {
              invoice.updatedBy = currentUserId;
              await manager.save(PurchaseInvoice, invoice);

              // Re-evaluate status
              await this.purchaseInvoiceRepository.autoHealStatus(invoice, manager);
            }
         }
      }

      await manager.save(PurchasePayment, payment);
      return payment;
    });
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const payment = await this.findOne(id);
    payment.deletedBy = currentUserId;
    await this.purchasePaymentRepository.save(payment);
    await this.purchasePaymentRepository.softRemove(payment);
  }

  async forceDelete(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(PurchasePaymentDetail, { purchasePaymentId: id });
      await manager.delete(PurchasePayment, id);
    });
  }
}
