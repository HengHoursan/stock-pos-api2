import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Unit } from '../entity/unit.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class UnitRepository extends Repository<Unit> {
  constructor(private dataSource: DataSource) {
    super(Unit, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Unit | null> {
    return this.findOne({ where: { name } });
  }

  async findByCode(code: string): Promise<Unit | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Unit[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Unit> | FindOptionsWhere<Unit>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { name: ILike(`%${search}%`) },
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
