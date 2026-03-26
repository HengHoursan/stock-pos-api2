import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RolePermission } from '@/role_permission/entity/role_permission.entity';
import { AssignPermissionsRequest, RevokePermissionsRequest } from '@/role_permission/dto';
import { RolePermissionRepository } from '@/role_permission/repository/role_permission.repository';

@Injectable()
export class RolePermissionService {
  constructor(
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async assign(dto: AssignPermissionsRequest): Promise<RolePermission[]> {
    const entities = dto.permissionIds.map((permissionId) =>
      this.rolePermissionRepository.create({
        roleId: dto.roleId,
        permissionId,
      }),
    );
    return this.rolePermissionRepository.save(entities);
  }

  async revoke(dto: RevokePermissionsRequest): Promise<void> {
    await this.rolePermissionRepository.delete({
      roleId: dto.roleId,
      permissionId: In(dto.permissionIds),
    });
  }

  async findByRoleId(roleId: number): Promise<RolePermission[]> {
    return this.rolePermissionRepository.findByRoleId(roleId);
  }
}
