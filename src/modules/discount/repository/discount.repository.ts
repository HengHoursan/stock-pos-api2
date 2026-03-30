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
    const { page, limit, sortBy, sortOrder, search } = pagination;

    let where: FindOptionsWhere<Discount> | FindOptionsWhere<Discount>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { code: ILike(`%${search}%`) },
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
