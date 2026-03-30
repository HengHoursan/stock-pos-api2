import { Injectable } from '@nestjs/common';
import { Brand } from '../entity/brand.entity';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class BrandRepository extends Repository<Brand> {
  constructor(private dataSource: DataSource) {
    super(Brand, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.findOne({ where: { name } });
  }

  async findByCode(code: string): Promise<Brand | null> {
    return this.findOne({ where: { code } });
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    return this.findOne({ where: { slug } });
  }

  async findByParentId(parentId: number): Promise<Brand | null> {
    return this.findOne({ where: { parentId } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Brand[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Brand> | FindOptionsWhere<Brand>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { name: ILike(`%${search}%`) },
        { code: ILike(`%${search}%`) },
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
