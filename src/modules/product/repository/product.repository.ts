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

  async findBySkuCode(skuCode: string): Promise<Product | null> {
    return this.findOne({ where: { skuCode } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Product[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Product> | FindOptionsWhere<Product>[] = {};

    // Base conditions for filtering (from the 'filter' object)
    const baseConditions: FindOptionsWhere<Product> = {};

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        baseConditions.status = filter.status === 'active';
      }
      if (filter.categoryId) {
        baseConditions.categoryId = Number(filter.categoryId);
      }
      if (filter.brandId) {
        baseConditions.brandId = Number(filter.brandId);
      }
      if (filter.unitId) {
        baseConditions.unitId = Number(filter.unitId);
      }
    }

    if (search && search.trim() !== '') {
      where = [
        { ...baseConditions, name: ILike(`%${search}%`) },
        { ...baseConditions, code: ILike(`%${search}%`) },
        { ...baseConditions, skuCode: ILike(`%${search}%`) },
      ];
    } else {
      where = baseConditions;
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
