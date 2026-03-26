import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Permission } from '../entity/permission.entity';

@Injectable()
export class PermissionRepository extends Repository<Permission> {
  constructor(private dataSource: DataSource) {
    super(Permission, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Permission | null> {
    return this.findOne({ where: { id } });
  }
}
