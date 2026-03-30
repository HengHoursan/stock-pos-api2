import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Currency } from '../entity/currency.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class CurrencyRepository extends Repository<Currency> {
  constructor(private dataSource: DataSource) {
    super(Currency, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<Currency | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Currency[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Currency> | FindOptionsWhere<Currency>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { code: ILike(`%${search}%`) },
        { country: ILike(`%${search}%`) },
        { currency: ILike(`%${search}%`) },
      ];
    }

    if (filter && filter !== 'all') {
      const statusValue = filter === 'active';
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
