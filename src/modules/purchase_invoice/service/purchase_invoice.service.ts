import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PurchaseInvoiceRepository } from '../repository/purchase_invoice.repository';
import { ProductRepository } from '../../product/repository/product.repository';
import {
  CreatePurchaseInvoiceRequest,
  UpdatePurchaseInvoiceRequest,
  UpdatePurchaseInvoiceStatusRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { PurchaseInvoice } from '../entity/purchase_invoice.entity';
import { PurchaseInvoiceDetail } from '../entity/purchase_invoice_detail.entity';
import { ProductDetail } from '../../product/entity/product_detail.entity';
import { Transaction } from '../../transaction/entity/transaction.entity';
import { PurchaseOrder } from '../../purchase_order/entity/purchase_order.entity';
import { PurchaseOrderRepository } from '../../purchase_order/repository/purchase_order.repository';
import { InvoiceStatus } from '@/common/enum/invoice_status.enum';
import { PaymentMethod } from '@/common/enum/payment_method.enum';
import { TransactionType } from '@/common/enum/transaction_type.enum';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class PurchaseInvoiceService {
  constructor(
    private readonly purchaseInvoiceRepository: PurchaseInvoiceRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreatePurchaseInvoiceRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseInvoice> {
    const code = dto.code?.trim() || generateCode('PINV');

    const existingCode = await this.purchaseInvoiceRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(
        `Purchase Invoice with code "${code}" already exists`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const invoice = manager.create(PurchaseInvoice, {
        code,
        supplierId: dto.supplierId,
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
      const savedInvoice = await manager.save(PurchaseInvoice, invoice);

      let totalPrice = 0;
      const purchaseOrderIds = new Set<number>();

      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(PurchaseInvoiceDetail, {
            purchaseInvoiceId: savedInvoice.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            purchaseOrderId: item.purchaseOrderId || null,
            purchaseOrderDetailId: item.purchaseOrderDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchaseInvoiceDetail, detail);
          totalPrice += Number(item.totalPrice);

          if (item.purchaseOrderId) {
            purchaseOrderIds.add(item.purchaseOrderId);
          }

          // Stock & Transaction logic
          const product = await this.productRepository.findOne({
            where: { id: item.productId },
            relations: ['detail'],
          });

          if (product && product.manageStock && product.detail) {
            const beginningStock = Number(product.detail.currentStock);
            const quantity = Number(item.quantity);
            const afterStock = beginningStock + quantity;

            // Update product detail stock
            await manager.update(
              ProductDetail,
              { productId: item.productId },
              {
                currentStock: afterStock,
                purchasePrice: item.totalPrice / item.quantity,
                updatedBy: currentUserId,
              },
            );

            // Create transaction record
            const transaction = manager.create(Transaction, {
              transactionCode: generateCode('TRX'),
              transactionDate: DateConvertor(dto.invoiceDate) || new Date(),
              transactionType: TransactionType.IN,
              productId: item.productId,
              beginningStock,
              quantity,
              afterStock,
              remarks: `Purchase Invoice: ${code}`,
              createdBy: currentUserId,
              updatedBy: currentUserId,
            });
            await manager.save(Transaction, transaction);
          }
        }
      }

      savedInvoice.totalPrice = totalPrice;
      await manager.save(PurchaseInvoice, savedInvoice);

      // Automatic Status Update
      await this.purchaseInvoiceRepository.autoHealStatus(
        savedInvoice,
        manager,
      );

      // Update Purchase Order invoiced line counts
      for (const orderId of purchaseOrderIds) {
        const order = await manager.findOne(PurchaseOrder, {
          where: { id: orderId },
          relations: ['details'],
        });
        if (order) {
          await this.purchaseOrderRepository.autoHealFulfillment(
            order,
            manager,
          );
        }
      }

      return manager.findOne(PurchaseInvoice, {
        where: { id: savedInvoice.id },
        relations: [
          'supplier',
          'details',
          'details.product',
          'details.purchaseOrder',
        ],
      }) as Promise<PurchaseInvoice>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseInvoice[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.purchaseInvoiceRepository.findAllWithPagination(pagination);

    for (const invoice of data) {
      await this.purchaseInvoiceRepository.autoHealStatus(invoice);
    }

    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<PurchaseInvoice[]> {
    return this.purchaseInvoiceRepository.find({
      relations: ['supplier', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PurchaseInvoice> {
    const invoice = await this.purchaseInvoiceRepository.findOne({
      where: { id },
      relations: [
        'supplier',
        'details',
        'details.product',
        'details.purchaseOrder',
      ],
    });
    if (!invoice) {
      throw new NotFoundException(`Purchase Invoice with id ${id} not found`);
    }

    await this.purchaseInvoiceRepository.autoHealStatus(invoice);

    return invoice;
  }

  async update(
    dto: UpdatePurchaseInvoiceRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseInvoice> {
    const invoice = await this.findOne(dto.id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot edit a purchase invoice that is not in DRAFT status',
      );
    }

    if (dto.code && dto.code !== invoice.code) {
      const existing = await this.purchaseInvoiceRepository.findByCode(
        dto.code,
      );
      if (existing) {
        throw new ConflictException(
          `Purchase Invoice with code "${dto.code}" already exists`,
        );
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) invoice.code = dto.code;
      if (dto.supplierId) invoice.supplierId = dto.supplierId;
      if (dto.invoiceDate)
        invoice.invoiceDate =
          DateConvertor(dto.invoiceDate) || invoice.invoiceDate;
      if (dto.description !== undefined) invoice.description = dto.description;
      if (dto.paidAmount !== undefined) invoice.paidAmount = dto.paidAmount;
      if (dto.paymentMethod !== undefined)
        invoice.paymentMethod = dto.paymentMethod;
      invoice.updatedBy = currentUserId;

      if (dto.details) {
        // Reverse stock for old details
        for (const oldDetail of invoice.details) {
          const product = await this.productRepository.findOne({
            where: { id: oldDetail.productId },
            relations: ['detail'],
          });

          if (product && product.manageStock && product.detail) {
            const currentStock = Number(product.detail.currentStock);
            const reversedStock = currentStock - Number(oldDetail.quantity);

            await manager.update(
              ProductDetail,
              { productId: oldDetail.productId },
              {
                currentStock: reversedStock,
                updatedBy: currentUserId,
              },
            );

            // Create reversal transaction
            const reversalTrx = manager.create(Transaction, {
              transactionCode: generateCode('TRX'),
              transactionDate: new Date(),
              transactionType: TransactionType.OUT,
              productId: oldDetail.productId,
              beginningStock: currentStock,
              quantity: Number(oldDetail.quantity),
              afterStock: reversedStock,
              remarks: `Reversed - Purchase Invoice Update: ${invoice.code}`,
              createdBy: currentUserId,
              updatedBy: currentUserId,
            });
            await manager.save(Transaction, reversalTrx);
          }
        }

        await manager.delete(PurchaseInvoiceDetail, {
          purchaseInvoiceId: invoice.id,
        });

        let totalPrice = 0;
        for (const item of dto.details) {
          const detail = manager.create(PurchaseInvoiceDetail, {
            purchaseInvoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            purchaseOrderId: item.purchaseOrderId || null,
            purchaseOrderDetailId: item.purchaseOrderDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchaseInvoiceDetail, detail);
          totalPrice += Number(item.totalPrice);

          // Re-apply stock for new details
          const product = await this.productRepository.findOne({
            where: { id: item.productId },
            relations: ['detail'],
          });

          if (product && product.manageStock && product.detail) {
            const beginningStock = Number(product.detail.currentStock);
            const quantity = Number(item.quantity);
            const afterStock = beginningStock + quantity;

            await manager.update(
              ProductDetail,
              { productId: item.productId },
              {
                currentStock: afterStock,
                purchasePrice: item.totalPrice / item.quantity,
                updatedBy: currentUserId,
              },
            );

            const transaction = manager.create(Transaction, {
              transactionCode: generateCode('TRX'),
              transactionDate: new Date(),
              transactionType: TransactionType.IN,
              productId: item.productId,
              beginningStock,
              quantity,
              afterStock,
              remarks: `Purchase Invoice Update: ${invoice.code}`,
              createdBy: currentUserId,
              updatedBy: currentUserId,
            });
            await manager.save(Transaction, transaction);
          }
        }

        invoice.totalLine = dto.details.length;
        invoice.totalPrice = totalPrice;
      }

      await manager.save(PurchaseInvoice, invoice);

      // Automatic Status Update
      await this.purchaseInvoiceRepository.autoHealStatus(invoice, manager);

      return manager.findOne(PurchaseInvoice, {
        where: { id: invoice.id },
        relations: [
          'supplier',
          'details',
          'details.product',
          'details.purchaseOrder',
        ],
      }) as Promise<PurchaseInvoice>;
    });
  }

  async updateStatus(
    dto: UpdatePurchaseInvoiceStatusRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseInvoice> {
    const invoice = await this.findOne(dto.id);
    invoice.status = dto.status;
    if (dto.status === InvoiceStatus.CANCELLED) {
      invoice.isCancel = true;
    }
    invoice.updatedBy = currentUserId;
    return this.purchaseInvoiceRepository.save(invoice);
  }

  async cancel(
    id: number,
    currentUserId: number | null = null,
  ): Promise<PurchaseInvoice> {
    const invoice = await this.findOne(id);
    if (invoice.isCancel) return invoice;

    return await this.dataSource.transaction(async (manager) => {
      invoice.isCancel = true;
      invoice.status = InvoiceStatus.CANCELLED;
      invoice.updatedBy = currentUserId;

      // Reverse stock for cancelled invoice
      for (const detail of invoice.details) {
        const product = await this.productRepository.findOne({
          where: { id: detail.productId },
          relations: ['detail'],
        });

        if (product && product.manageStock && product.detail) {
          const currentStock = Number(product.detail.currentStock);
          const reversedStock = currentStock - Number(detail.quantity);

          await manager.update(
            ProductDetail,
            { productId: detail.productId },
            {
              currentStock: reversedStock,
              updatedBy: currentUserId,
            },
          );

          const reversalTrx = manager.create(Transaction, {
            transactionCode: generateCode('TRX'),
            transactionDate: new Date(),
            transactionType: TransactionType.OUT,
            productId: detail.productId,
            beginningStock: currentStock,
            quantity: Number(detail.quantity),
            afterStock: reversedStock,
            remarks: `Cancelled - Purchase Invoice: ${invoice.code}`,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(Transaction, reversalTrx);
        }
      }

      // Reverse Purchase Order fulfillment
      const purchaseOrderIds = new Set<number>();
      for (const detail of invoice.details) {
        if (detail.purchaseOrderId) {
          purchaseOrderIds.add(detail.purchaseOrderId);
        }
      }

      for (const orderId of purchaseOrderIds) {
        const order = await manager.findOne(PurchaseOrder, {
          where: { id: orderId },
          relations: ['details'],
        });
        if (order) {
          await this.purchaseOrderRepository.autoHealFulfillment(
            order,
            manager,
          );
        }
      }

      await manager.save(PurchaseInvoice, invoice);
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
    await this.purchaseInvoiceRepository.save(invoice);
    await this.purchaseInvoiceRepository.softRemove(invoice);
  }

  async forceDelete(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    if (!invoice.isCancel) {
      await this.cancel(id, null);
    }
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(PurchaseInvoiceDetail, { purchaseInvoiceId: id });
      await manager.delete(PurchaseInvoice, id);
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

    await this.purchaseInvoiceRepository.update(ids, {
      status,
      updatedBy: currentUserId,
    });
  }
}
