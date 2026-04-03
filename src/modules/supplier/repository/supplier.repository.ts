import { Injectable } from '@nestjs/common';
import { Supplier } from '../entity/supplier.entity';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class SupplierRepository extends Repository<Supplier> {
  constructor(private dataSource: DataSource) {
    super(Supplier, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Supplier | null> {
    return this.findOne({ where: { name } });
  }

  async findByCode(code: string): Promise<Supplier | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Supplier[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Supplier> | FindOptionsWhere<Supplier>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { name: ILike(`%${search}%`) },
        { code: ILike(`%${search}%`) },
        { nameLatin: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
        { phoneNumber: ILike(`%${search}%`) },
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
