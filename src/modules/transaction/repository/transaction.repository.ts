import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere, EntityManager } from 'typeorm';
import { Transaction } from '../entity/transaction.entity';
import { PaginationRequest } from '@/common/dto';
import { ProductDetail } from '../../product/entity/product_detail.entity';

@Injectable()
export class TransactionRepository extends Repository<Transaction> {
  constructor(private dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async createWithStockUpdate(
    transactionData: Partial<Transaction>,
    productId: number,
    newStock: number,
  ): Promise<Transaction> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      try {
        // 1. Save Transaction
        const transaction = manager.create(Transaction, transactionData);
        const savedTransaction = await manager.save(Transaction, transaction);

        // 2. Update Product Stock
        await manager.update(ProductDetail, { productId }, { currentStock: newStock });

        return savedTransaction;
      } catch (error) {
        throw new InternalServerErrorException('Failed to process stock transaction: ' + error.message);
      }
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Transaction[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Transaction> | FindOptionsWhere<Transaction>[] = {};

    const baseConditions: FindOptionsWhere<Transaction> = {};
    
    if (filter) {
      if (filter.productId) {
        baseConditions.productId = Number(filter.productId);
      }
      if (filter.transactionType) {
        baseConditions.transactionType = filter.transactionType as any;
      }
    }

    if (search && search.trim() !== '') {
      where = [
        { ...baseConditions, transactionCode: ILike(`%${search}%`) },
        { ...baseConditions, remarks: ILike(`%${search}%`) },
        { ...baseConditions, product: { name: ILike(`%${search}%`) } },
        { ...baseConditions, product: { code: ILike(`%${search}%`) } },
      ];
    } else {
      where = baseConditions;
    }

    return this.findAndCount({
      where,
      relations: ['product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }

  async findByCode(transactionCode: string): Promise<Transaction | null> {
    return this.findOne({ where: { transactionCode } });
  }
}
