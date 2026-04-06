import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { SaleInvoice } from '../entity/sale_invoice.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class SaleInvoiceRepository extends Repository<SaleInvoice> {
  constructor(private dataSource: DataSource) {
    super(SaleInvoice, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<SaleInvoice | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleInvoice[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<SaleInvoice> | FindOptionsWhere<SaleInvoice>[] = {};
    const baseConditions: FindOptionsWhere<SaleInvoice> = {};

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        baseConditions.status = Number(filter.status);
      }
      if (filter.customerId) {
        baseConditions.customerId = Number(filter.customerId);
      }
    }

    if (search && search.trim() !== '') {
      where = [
        { ...baseConditions, code: ILike(`%${search}%`) },
        { ...baseConditions, description: ILike(`%${search}%`) },
      ];
    } else {
      where = baseConditions;
    }

    return this.findAndCount({
      where,
      relations: ['customer', 'details', 'details.product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
