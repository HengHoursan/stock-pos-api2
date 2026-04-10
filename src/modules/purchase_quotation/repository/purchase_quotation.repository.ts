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
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    const queryBuilder = this.createQueryBuilder('purchase_quotation')
      .leftJoinAndSelect('purchase_quotation.details', 'details')
      .leftJoinAndSelect('details.product', 'product');

    // Handle Search
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(purchase_quotation.code ILIKE :search OR purchase_quotation.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Handle Filters
    if (filter) {
      // quotationDate Range
      if (filter.startDate) {
        queryBuilder.andWhere('purchase_quotation.quotationDate >= :startDate', { startDate: new Date(filter.startDate) });
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('purchase_quotation.quotationDate <= :endDate', { endDate });
      }
    }

    if (sortBy && sortOrder) {
      const orderColumn = sortBy.includes('.') ? sortBy : `purchase_quotation.${sortBy}`;
      queryBuilder.orderBy(orderColumn, sortOrder as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('purchase_quotation.createdAt', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
