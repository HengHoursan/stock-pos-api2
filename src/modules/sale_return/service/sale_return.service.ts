import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaleReturnRepository } from '@/sale_return/repository/sale_return.repository';
import { ProductRepository } from '@/product/repository/product.repository';
import {
  CreateSaleReturnRequest,
  UpdateSaleReturnRequest,
  UpdateSaleReturnStatusRequest,
} from '@/sale_return/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { SaleReturn } from '@/sale_return/entity/sale_return.entity';
import { SaleReturnDetail } from '@/sale_return/entity/sale_return_detail.entity';
import { ProductDetail } from '@/product/entity/product_detail.entity';
import { Transaction } from '@/transaction/entity/transaction.entity';
import { InvoiceStatus } from '@/common/enum/invoice_status.enum';
import { TransactionType } from '@/common/enum/transaction_type.enum';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class SaleReturnService {
  constructor(
    private readonly saleReturnRepository: SaleReturnRepository,
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateSaleReturnRequest,
    currentUserId: number | null = null,
  ): Promise<SaleReturn> {
    const code = dto.code?.trim() || generateCode('SRET');

    const existingCode = await this.saleReturnRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(
        `Sale Return with code "${code}" already exists`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const saleReturn = manager.create(SaleReturn, {
        code,
        customerId: dto.customerId,
        returnDate: (DateConvertor(dto.returnDate) as Date) || new Date(),
        description: dto.description,
        status: InvoiceStatus.DRAFT,
        isCancel: false,
        totalLine: dto.details?.length || 0,
        totalPrice: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedReturn = await manager.save(SaleReturn, saleReturn);

      let totalPrice = 0;

      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(SaleReturnDetail, {
            saleReturnId: savedReturn.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          });
          await manager.save(SaleReturnDetail, detail);
          totalPrice += Number(item.totalPrice);

          // Stock & Transaction logic (Returning stock from customer means IN)
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
                updatedBy: currentUserId,
              },
            );

            // Create transaction record
            const transaction = manager.create(Transaction, {
              transactionCode: generateCode('TRX'),
              transactionDate: (DateConvertor(dto.returnDate) as Date) || new Date(),
              transactionType: TransactionType.IN, // STOCK IN because customer returns it
              productId: item.productId,
              beginningStock,
              quantity,
              afterStock,
              remarks: `Sale Return: ${code}`,
              createdBy: currentUserId,
              updatedBy: currentUserId,
            });
            await manager.save(Transaction, transaction);
          }
        }
      }

      savedReturn.totalPrice = totalPrice;
      await manager.save(SaleReturn, savedReturn);

      return manager.findOne(SaleReturn, {
        where: { id: savedReturn.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleReturn>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleReturn[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.saleReturnRepository.findAllWithPagination(pagination);
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<SaleReturn[]> {
    return this.saleReturnRepository.find({
      relations: ['customer', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SaleReturn> {
    const saleReturn = await this.saleReturnRepository.findOne({
      where: { id },
      relations: ['customer', 'details', 'details.product'],
    });
    if (!saleReturn) {
      throw new NotFoundException(`Sale Return with id ${id} not found`);
    }
    return saleReturn;
  }

  async update(
    dto: UpdateSaleReturnRequest,
    currentUserId: number | null = null,
  ): Promise<SaleReturn> {
    const saleReturn = await this.findOne(dto.id);

    if (saleReturn.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot edit a sale return that is not in DRAFT status',
      );
    }

    if (dto.code && dto.code !== saleReturn.code) {
      const existing = await this.saleReturnRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(
          `Sale Return with code "${dto.code}" already exists`,
        );
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) saleReturn.code = dto.code;
      if (dto.customerId) saleReturn.customerId = dto.customerId;
      if (dto.returnDate)
        saleReturn.returnDate =
          (DateConvertor(dto.returnDate) as Date) || saleReturn.returnDate;
      if (dto.description !== undefined)
        saleReturn.description = dto.description;
      saleReturn.updatedBy = currentUserId;

      if (dto.details) {
        // Reverse stock for old return details (Meaning STOCK OUT)
        for (const oldDetail of saleReturn.details) {
          const product = await this.productRepository.findOne({
            where: { id: oldDetail.productId },
            relations: ['detail'],
          });

          if (product && product.manageStock && product.detail) {
            const currentStock = Number(product.detail.currentStock);
            const reversedStock = Math.max(
              0,
              currentStock - Number(oldDetail.quantity),
            );

            await manager.update(
              ProductDetail,
              { productId: oldDetail.productId },
              {
                currentStock: reversedStock,
                updatedBy: currentUserId,
              },
            );

            // Reversal transaction
            const reversalTrx = manager.create(Transaction, {
              transactionCode: generateCode('TRX'),
              transactionDate: new Date(),
              transactionType: TransactionType.OUT,
              productId: oldDetail.productId,
              beginningStock: currentStock,
              quantity: Number(oldDetail.quantity),
              afterStock: reversedStock,
              remarks: `Reversed - Sale Return Update: ${saleReturn.code}`,
              createdBy: currentUserId,
              updatedBy: currentUserId,
            });
            await manager.save(Transaction, reversalTrx);
          }
        }

        await manager.delete(SaleReturnDetail, { saleReturnId: saleReturn.id });

        let totalPrice = 0;
        for (const item of dto.details) {
          const detail = manager.create(SaleReturnDetail, {
            saleReturnId: saleReturn.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          });
          await manager.save(SaleReturnDetail, detail);
          totalPrice += Number(item.totalPrice);

          // Apply stock for new details (STOCK IN)
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
                updatedBy: currentUserId,
              },
            );

            const transaction = manager.create(Transaction, {
              transactionCode: generateCode('TRX'),
              transactionDate: (saleReturn.returnDate as Date) || new Date(),
              transactionType: TransactionType.IN,
              productId: item.productId,
              beginningStock,
              quantity,
              afterStock,
              remarks: `Sale Return Update: ${saleReturn.code}`,
              createdBy: currentUserId,
              updatedBy: currentUserId,
            });
            await manager.save(Transaction, transaction);
          }
        }

        saleReturn.totalLine = dto.details.length;
        saleReturn.totalPrice = totalPrice;
      }

      await manager.save(SaleReturn, saleReturn);

      return manager.findOne(SaleReturn, {
        where: { id: saleReturn.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleReturn>;
    });
  }

  async updateStatus(
    dto: UpdateSaleReturnStatusRequest,
    currentUserId: number | null = null,
  ): Promise<SaleReturn> {
    const saleReturn = await this.findOne(dto.id);
    saleReturn.status = dto.status;
    if (dto.status === InvoiceStatus.CANCELLED) {
      saleReturn.isCancel = true;
    }
    saleReturn.updatedBy = currentUserId;
    return this.saleReturnRepository.save(saleReturn);
  }

  async cancel(
    id: number,
    currentUserId: number | null = null,
  ): Promise<SaleReturn> {
    const saleReturn = await this.findOne(id);
    if (saleReturn.status === InvoiceStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed sale return');
    }

    return await this.dataSource.transaction(async (manager) => {
      saleReturn.isCancel = true;
      saleReturn.status = InvoiceStatus.CANCELLED;
      saleReturn.updatedBy = currentUserId;

      // Reverse stock (STOCK OUT)
      for (const detail of saleReturn.details) {
        const product = await this.productRepository.findOne({
          where: { id: detail.productId },
          relations: ['detail'],
        });

        if (product && product.manageStock && product.detail) {
          const currentStock = Number(product.detail.currentStock);
          const reversedStock = Math.max(
            0,
            currentStock - Number(detail.quantity),
          );

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
            remarks: `Cancelled - Sale Return: ${saleReturn.code}`,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(Transaction, reversalTrx);
        }
      }

      await manager.save(SaleReturn, saleReturn);
      return saleReturn;
    });
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const saleReturn = await this.findOne(id);
    saleReturn.deletedBy = currentUserId;
    await this.saleReturnRepository.save(saleReturn);
    await this.saleReturnRepository.softRemove(saleReturn);
  }

  async forceDelete(id: number): Promise<void> {
    const saleReturn = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(SaleReturnDetail, { saleReturnId: id });
      await manager.delete(SaleReturn, id);
    });
  }
}
