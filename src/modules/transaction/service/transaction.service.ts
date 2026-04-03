import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionRepository } from '../repository/transaction.repository';
import { ProductRepository } from '../../product/repository/product.repository';
import { ProductDetail } from '../../product/entity/product_detail.entity';
import { CreateTransactionRequest, UpdateTransactionRequest } from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { Transaction } from '../entity/transaction.entity';
import { TransactionType } from '@/common/enum/transaction_type.enum';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateTransactionRequest,
    currentUserId: number | null = null,
  ): Promise<Transaction> {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
      relations: ['detail'],
    });

    if (!product || !product.detail) {
      throw new NotFoundException(`Product or product details not found`);
    }

    const transactionCode = dto.transactionCode?.trim() || generateCode('TRX');
    if (await this.transactionRepository.findByCode(transactionCode)) {
      throw new ConflictException(`Transaction with code "${transactionCode}" already exists`);
    }

    const beginningStock = Number(product.detail.currentStock);
    const quantity = Number(dto.quantity);
    let afterStock = beginningStock;

    if (dto.transactionType === TransactionType.IN) afterStock += quantity;
    else if (dto.transactionType === TransactionType.OUT) afterStock -= quantity;
    else if (dto.transactionType === TransactionType.ADJUSTMENT) afterStock = quantity;

    return this.transactionRepository.createWithStockUpdate(
      {
        ...dto,
        transactionCode,
        transactionDate: DateConvertor(dto.transactionDate) || new Date(),
        beginningStock,
        afterStock,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      },
      dto.productId,
      afterStock,
    );
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Transaction[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.transactionRepository.findAllWithPagination(pagination);
    
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }

  async update(
    dto: UpdateTransactionRequest,
    currentUserId: number | null = null,
  ): Promise<Transaction> {
    const transaction = await this.findOne(dto.id);
    
    if (dto.transactionDate) {
      const convertedDate = DateConvertor(dto.transactionDate);
      if (convertedDate) {
        transaction.transactionDate = convertedDate;
      }
    }
    
    if (dto.remarks !== undefined) {
      transaction.remarks = dto.remarks;
    }

    transaction.updatedBy = currentUserId;
    return this.transactionRepository.save(transaction);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const transaction = await this.findOne(id);
    transaction.deletedBy = currentUserId;
    await this.transactionRepository.save(transaction);
    await this.transactionRepository.softRemove(transaction);
  }
}
