import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { PurchaseQuotation } from '../entity/purchase_quotation.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class PurchaseQuotationRepository extends Repository<PurchaseQuotation> {
  constructor(private dataSource: DataSource) {
    super(PurchaseQuotation, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<PurchaseQuotation | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseQuotation[], number]> {
    const { page, limit, sortBy, sortOrder, search } = pagination;

    let where: FindOptionsWhere<PurchaseQuotation> | FindOptionsWhere<PurchaseQuotation>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { code: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) },
      ];
    }

    return this.findAndCount({
      where,
      relations: ['details', 'details.product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
