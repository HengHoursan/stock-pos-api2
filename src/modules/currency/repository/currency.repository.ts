import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Currency } from '../entity/currency.entity';

@Injectable()
export class CurrencyRepository extends Repository<Currency> {
  constructor(private dataSource: DataSource) {
    super(Currency, dataSource.createEntityManager());
  }

  async findByCode(code: string): Promise<Currency | null> {
    return this.findOne({ where: { code } });
  }
}
