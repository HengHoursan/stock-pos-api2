import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Role } from '../entity/role.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Role | null> {
    return this.findOne({ where: { id } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Role[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Role> | FindOptionsWhere<Role>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { name: ILike(`%${search}%`) },
        { displayName: ILike(`%${search}%`) },
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
