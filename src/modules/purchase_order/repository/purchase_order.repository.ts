import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { PurchaseOrder } from '../entity/purchase_order.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class PurchaseOrderRepository extends Repository<PurchaseOrder> {
  constructor(private dataSource: DataSource) {
    super(PurchaseOrder, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<PurchaseOrder | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseOrder[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<PurchaseOrder> | FindOptionsWhere<PurchaseOrder>[] = {};
    const baseConditions: FindOptionsWhere<PurchaseOrder> = {};

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        baseConditions.status = Number(filter.status);
      }
      if (filter.supplierId) {
        baseConditions.supplierId = Number(filter.supplierId);
      }
    }

    if (search && search.trim() !== '') {
      where = [
        { ...baseConditions, code: ILike(`%${search}%`) },
        { ...baseConditions, description: ILike(`%${search}%`) },
      ];
    } else {
      where = baseConditions;
    }

    return this.findAndCount({
      where,
      relations: ['supplier', 'details', 'details.product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
