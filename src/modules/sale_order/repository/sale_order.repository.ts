import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { SaleOrder } from '../entity/sale_order.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class SaleOrderRepository extends Repository<SaleOrder> {
  constructor(private dataSource: DataSource) {
    super(SaleOrder, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<SaleOrder | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleOrder[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<SaleOrder> | FindOptionsWhere<SaleOrder>[] = {};
    const baseConditions: FindOptionsWhere<SaleOrder> = {};

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        baseConditions.status = Number(filter.status);
      }
      if (filter.customerId) {
        baseConditions.customerId = Number(filter.customerId);
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
      relations: ['customer', 'details', 'details.product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
