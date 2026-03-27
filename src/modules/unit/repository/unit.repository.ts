import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Unit } from '../entity/unit.entity';

@Injectable()
export class UnitRepository extends Repository<Unit> {
  constructor(private dataSource: DataSource) {
    super(Unit, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Unit | null> {
    return this.findOne({ where: { name } });
  }

  async findByCode(code: string): Promise<Unit | null> {
    return this.findOne({ where: { code } });
  }
}
