import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Discount } from '../entity/discount.entity';

@Injectable()
export class DiscountRepository extends Repository<Discount> {
  constructor(private dataSource: DataSource) {
    super(Discount, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<Discount | null> {
    return this.findOne({ where: { code } });
  }
}
