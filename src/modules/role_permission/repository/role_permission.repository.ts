import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RolePermission } from '../entity/role_permission.entity';

@Injectable()
export class RolePermissionRepository extends Repository<RolePermission> {
  constructor(private dataSource: DataSource) {
    super(RolePermission, dataSource.createEntityManager());
  }

  async findByRoleId(roleId: number): Promise<RolePermission[]> {
    return this.find({
      where: { roleId },
      relations: ['permission'],
    });
  }
}
