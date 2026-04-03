import { Injectable } from '@nestjs/common';
import { Customer } from '../entity/customer.entity';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class CustomerRepository extends Repository<Customer> {
  constructor(private dataSource: DataSource) {
    super(Customer, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Customer | null> {
    return this.findOne({ where: { name } });
  }

  async findByCode(code: string): Promise<Customer | null> {
    return this.findOne({ where: { code } });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Customer[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<Customer> | FindOptionsWhere<Customer>[] = {};

    // Base conditions for filtering (non-search)
    const baseConditions: FindOptionsWhere<Customer> = {};

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        baseConditions.status = filter.status === 'active';
      }
      if (filter.customerType) {
        baseConditions.type = Number(filter.customerType);
      }
    }

    if (search && search.trim() !== '') {
      where = [
        { ...baseConditions, name: ILike(`%${search}%`) },
        { ...baseConditions, code: ILike(`%${search}%`) },
        { ...baseConditions, nameLatin: ILike(`%${search}%`) },
        { ...baseConditions, email: ILike(`%${search}%`) },
        { ...baseConditions, phoneNumber: ILike(`%${search}%`) },
      ];
    } else {
      where = baseConditions;
    }

    return this.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
