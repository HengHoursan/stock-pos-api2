import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Permission } from '../entity/permission.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class PermissionRepository extends Repository<Permission> {
  constructor(private dataSource: DataSource) {
    super(Permission, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Permission | null> {
    return this.findOne({ where: { id } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Permission[], number]> {
    const { page, limit, sortBy, sortOrder, search } = pagination;

    let where: FindOptionsWhere<Permission> | FindOptionsWhere<Permission>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { name: ILike(`%${search}%`) },
        { displayName: ILike(`%${search}%`) },
        { group: ILike(`%${search}%`) },
      ];
    }

    return this.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
