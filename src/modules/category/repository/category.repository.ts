import { Injectable } from '@nestjs/common';
import { Category } from '../entity/category.entity';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Category | null> {
    return this.findOne({ where: { name } });
  }

  async findByCode(code: string): Promise<Category | null> {
    return this.findOne({ where: { code } });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.findOne({ where: { slug } });
  }

  async findByParentId(parentId: number): Promise<Category | null> {
    return this.findOne({ where: { parentId } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Category[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Category> | FindOptionsWhere<Category>[] = {};

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
