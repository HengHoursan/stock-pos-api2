import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../entity/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Role | null> {
    return this.findOne({ where: { id } });
  }
}
