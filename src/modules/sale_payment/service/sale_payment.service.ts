import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SalePaymentRepository } from '@/sale_payment/repository/sale_payment.repository';
import {
  CreateSalePaymentRequest,
  UpdateSalePaymentRequest,
} from '@/sale_payment/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { SalePayment } from '@/sale_payment/entity/sale_payment.entity';
import { SalePaymentDetail } from '@/sale_payment/entity/sale_payment_detail.entity';
import { SaleInvoice } from '@/sale_invoice/entity/sale_invoice.entity';
import { SaleOrderRepository } from '@/sale_order/repository/sale_order.repository';
import { SaleOrder } from '@/sale_order/entity/sale_order.entity';
import { SaleInvoiceRepository } from '@/sale_invoice/repository/sale_invoice.repository';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class SalePaymentService {
  constructor(
    private readonly salePaymentRepository: SalePaymentRepository,
    private readonly saleOrderRepository: SaleOrderRepository,
    private readonly saleInvoiceRepository: SaleInvoiceRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateSalePaymentRequest,
    currentUserId: number | null = null,
  ): Promise<SalePayment> {
    const code = dto.code?.trim() || generateCode('SPAY');

    const existingCode = await this.salePaymentRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(
        `Sale Payment with code "${code}" already exists`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const payment = manager.create(SalePayment, {
        code,
        customerId: dto.customerId,
        paymentDate: DateConvertor(dto.paymentDate) || new Date(),
        description: dto.description,
        isCancel: false,
        totalPrice: 0,
        paidAmount: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedPayment = await manager.save(SalePayment, payment);

      let totalPaidAmount = 0;

      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(SalePaymentDetail, {
            salePaymentId: savedPayment.id,
            saleInvoiceId: item.saleInvoiceId,
            paidAmount: item.paidAmount,
          });
          await manager.save(SalePaymentDetail, detail);
          totalPaidAmount += Number(item.paidAmount);

          // Update Sale Invoice paidAmount
          const invoice = await manager.findOne(SaleInvoice, {
            where: { id: item.saleInvoiceId },
          });
          if (invoice) {
            invoice.paidAmount =
              Number(invoice.paidAmount) + Number(item.paidAmount);

            invoice.updatedBy = currentUserId;
            await manager.save(SaleInvoice, invoice);

            // Automatic Status Update
            await this.saleInvoiceRepository.autoHealStatus(invoice, manager);

            // Trigger Order Healing
            const invoiceDetails = (await manager
              .createQueryBuilder('sale_invoice_details', 'sid')
              .where('sid.sale_invoice_id = :invoiceId', {
                invoiceId: invoice.id,
              })
              .andWhere('sid.sale_order_id IS NOT NULL')
              .getRawMany()) as unknown as Array<{ sale_order_id: number }>;

            const orderIds = [
              ...new Set(invoiceDetails.map((d) => d.sale_order_id)),
            ];
            for (const orderId of orderIds) {
              const order = await manager.findOne(SaleOrder, {
                where: { id: orderId },
                relations: ['details'],
              });
              if (order) {
                await this.saleOrderRepository.autoHealFulfillment(
                  order,
                  manager,
                );
              }
            }
          } else {
            throw new NotFoundException(
              `Sale Invoice with id ${item.saleInvoiceId} not found`,
            );
          }
        }
      }

      savedPayment.totalPrice = totalPaidAmount; // Assuming total payment is sum of invoice payments
      savedPayment.paidAmount = totalPaidAmount;
      await manager.save(SalePayment, savedPayment);

      return manager.findOne(SalePayment, {
        where: { id: savedPayment.id },
        relations: ['customer', 'details', 'details.saleInvoice'],
      }) as Promise<SalePayment>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SalePayment[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.salePaymentRepository.findAllWithPagination(pagination);
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<SalePayment[]> {
    return this.salePaymentRepository.find({
      relations: ['customer', 'details', 'details.saleInvoice'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SalePayment> {
    const payment = await this.salePaymentRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'details',
        'details.saleInvoice',
        'details.saleInvoice.details',
        'details.saleInvoice.details.product',
      ],
    });
    if (!payment) {
      throw new NotFoundException(`Sale Payment with id ${id} not found`);
    }
    return payment;
  }

  async update(
    dto: UpdateSalePaymentRequest,
    currentUserId: number | null = null,
  ): Promise<SalePayment> {
    const payment = await this.findOne(dto.id);

    if (payment.isCancel) {
      throw new BadRequestException('Cannot edit a cancelled sale payment');
    }

    if (dto.code && dto.code !== payment.code) {
      const existing = await this.salePaymentRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(
          `Sale Payment with code "${dto.code}" already exists`,
        );
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      // Reverse old payments from invoices
      for (const oldDetail of payment.details) {
        const invoice = await manager.findOne(SaleInvoice, {
          where: { id: oldDetail.saleInvoiceId },
        });
        if (invoice) {
          invoice.paidAmount =
            Number(invoice.paidAmount) - Number(oldDetail.paidAmount);

          invoice.updatedBy = currentUserId;
          await manager.save(SaleInvoice, invoice);

          // Re-evaluate status
          await this.saleInvoiceRepository.autoHealStatus(invoice, manager);
        }
      }

      if (dto.code) payment.code = dto.code;
      if (dto.customerId) payment.customerId = dto.customerId;
      if (dto.paymentDate)
        payment.paymentDate =
          DateConvertor(dto.paymentDate) || payment.paymentDate;
      if (dto.description !== undefined) payment.description = dto.description;
      payment.updatedBy = currentUserId;

      if (dto.details) {
        await manager.delete(SalePaymentDetail, { salePaymentId: payment.id });

        let totalPaidAmount = 0;
        for (const item of dto.details) {
          const detail = manager.create(SalePaymentDetail, {
            salePaymentId: payment.id,
            saleInvoiceId: item.saleInvoiceId,
            paidAmount: item.paidAmount,
          });
          await manager.save(SalePaymentDetail, detail);
          totalPaidAmount += Number(item.paidAmount);

          // Apply new payments to invoices
          const invoice = await manager.findOne(SaleInvoice, {
            where: { id: item.saleInvoiceId },
          });
          if (invoice) {
            invoice.paidAmount =
              Number(invoice.paidAmount) + Number(item.paidAmount);

            invoice.updatedBy = currentUserId;
            await manager.save(SaleInvoice, invoice);

            // Re-evaluate status
            await this.saleInvoiceRepository.autoHealStatus(invoice, manager);

            // Trigger Order Healing
            const invoiceDetails = (await manager
              .createQueryBuilder('sale_invoice_details', 'sid')
              .where('sid.sale_invoice_id = :invoiceId', {
                invoiceId: invoice.id,
              })
              .andWhere('sid.sale_order_id IS NOT NULL')
              .getRawMany()) as unknown as Array<{ sale_order_id: number }>;

            const orderIds = [
              ...new Set(invoiceDetails.map((d) => d.sale_order_id)),
            ];
            for (const orderId of orderIds) {
              const order = await manager.findOne(SaleOrder, {
                where: { id: orderId },
                relations: ['details'],
              });
              if (order) {
                await this.saleOrderRepository.autoHealFulfillment(
                  order,
                  manager,
                );
              }
            }
          }
        }
        payment.totalPrice = totalPaidAmount;
        payment.paidAmount = totalPaidAmount;
      }

      await manager.save(SalePayment, payment);

      return manager.findOne(SalePayment, {
        where: { id: payment.id },
        relations: ['customer', 'details', 'details.saleInvoice'],
      }) as Promise<SalePayment>;
    });
  }

  async cancel(
    id: number,
    currentUserId: number | null = null,
  ): Promise<SalePayment> {
    const payment = await this.findOne(id);
    if (payment.isCancel) {
      throw new BadRequestException('Sale Payment is already cancelled');
    }

    return await this.dataSource.transaction(async (manager) => {
      payment.isCancel = true;
      payment.updatedBy = currentUserId;

      // Reverse payments from invoices
      for (const detail of payment.details) {
        const invoice = await manager.findOne(SaleInvoice, {
          where: { id: detail.saleInvoiceId },
        });
        if (invoice) {
          invoice.paidAmount =
            Number(invoice.paidAmount) - Number(detail.paidAmount);

          invoice.updatedBy = currentUserId;
          await manager.save(SaleInvoice, invoice);

          // Re-evaluate status
          await this.saleInvoiceRepository.autoHealStatus(invoice, manager);

          // Trigger Order Healing
          const invoiceDetails = (await manager
            .createQueryBuilder('sale_invoice_details', 'sid')
            .where('sid.sale_invoice_id = :invoiceId', {
              invoiceId: invoice.id,
            })
            .andWhere('sid.sale_order_id IS NOT NULL')
            .getRawMany()) as unknown as Array<{ sale_order_id: number }>;

          const orderIds = [
            ...new Set(invoiceDetails.map((d) => d.sale_order_id)),
          ];
          for (const orderId of orderIds) {
            const order = await manager.findOne(SaleOrder, {
              where: { id: orderId },
              relations: ['details'],
            });
            if (order) {
              await this.saleOrderRepository.autoHealFulfillment(
                order,
                manager,
              );
            }
          }
        }
      }

      await manager.save(SalePayment, payment);
      return payment;
    });
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const payment = await this.findOne(id);
    payment.deletedBy = currentUserId;
    await this.salePaymentRepository.save(payment);
    await this.salePaymentRepository.softRemove(payment);
  }

  async forceDelete(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // If it wasn't cancelled, we should ideally reverse it before deleting,
      // but forceDelete implies full removal. Standard practice is to cancel then delete.
      await manager.delete(SalePaymentDetail, { salePaymentId: id });
      await manager.delete(SalePayment, id);
    });
  }
}
