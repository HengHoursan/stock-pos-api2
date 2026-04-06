import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { PurchaseInvoice } from '../entity/purchase_invoice.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class PurchaseInvoiceRepository extends Repository<PurchaseInvoice> {
  constructor(private dataSource: DataSource) {
    super(PurchaseInvoice, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<PurchaseInvoice | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseInvoice[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<PurchaseInvoice> | FindOptionsWhere<PurchaseInvoice>[] = {};
    const baseConditions: FindOptionsWhere<PurchaseInvoice> = {};

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        baseConditions.status = Number(filter.status);
      }
      if (filter.supplierId) {
        baseConditions.supplierId = Number(filter.supplierId);
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
      relations: ['supplier', 'details', 'details.product'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
