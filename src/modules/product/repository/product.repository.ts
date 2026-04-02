import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Product } from '../entity/product.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<Product | null> {
    return this.findOne({ where: { code } });
  }

  async findByName(name: string): Promise<Product | null> {
    return this.findOne({ where: { name } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Product[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Product> | FindOptionsWhere<Product>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { name: ILike(`%${search}%`) },
        { code: ILike(`%${search}%`) },
        { skuCode: ILike(`%${search}%`) },
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
      relations: ['category', 'brand', 'unit', 'detail'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
