import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Discount } from '../entity/discount.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class DiscountRepository extends Repository<Discount> {
  constructor(private dataSource: DataSource) {
    super(Discount, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<Discount | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Discount[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Discount> | FindOptionsWhere<Discount>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { code: ILike(`%${search}%`) },
      ];
    }

    if (filter && filter.status && filter.status !== 'all') {
      const statusValue = filter.status === 'active';
      if (Array.isArray(where)) {
        where = where.map((condition) => ({ ...condition, status: statusValue }));
      } else {
        where.status = statusValue;
      }
    }

    return this.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
