import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/role/entity/role.entity';
import { RolePermission } from '../../role_permission/entity/role_permission.entity';
import { CreateRoleRequest, UpdateRoleRequest } from '@/role/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { RoleRepository } from '@/role/repository/role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(
    dto: CreateRoleRequest,
    currentUserId: number | null = null,
  ): Promise<Role> {
    const role = this.roleRepository.create({
      ...dto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.roleRepository.save(role);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Role[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.roleRepository.findAllWithPagination(pagination);

    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role with id ${id} not found`);
    return role;
  }

  async update(
    dto: UpdateRoleRequest,
    currentUserId: number | null = null,
  ): Promise<Role> {
    const role = await this.findOne(dto.id);
    Object.assign(role, dto);
    role.updatedBy = currentUserId;
    return this.roleRepository.save(role);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const role = await this.findOne(id);
    role.deletedBy = currentUserId;
    await this.roleRepository.save(role);
    await this.roleRepository.softRemove(role);
  }

  async forceDelete(id: number): Promise<void> {
    const result = await this.roleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
  }

  async duplicate(
    id: number,
    currentUserId: number | null = null,
  ): Promise<Role> {
    const source = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions'],
    });
    if (!source) throw new NotFoundException(`Role with id ${id} not found`);

    return await this.roleRepository.manager.transaction(async (manager) => {
      const role = manager.create(Role, {
        name: `${source.name}_copy_${Date.now()}`,
        displayName: `${source.displayName} (Copy)`,
        status: source.status,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedRole = await manager.save(Role, role);

      if (source.rolePermissions && source.rolePermissions.length > 0) {
        for (const rp of source.rolePermissions) {
          const newRp = manager.create(RolePermission, {
            roleId: savedRole.id,
            permissionId: rp.permissionId,
          });
          await manager.save(RolePermission, newRp);
        }
      }

      return manager.findOne(Role, {
        where: { id: savedRole.id },
        relations: ['rolePermissions'],
      }) as Promise<Role>;
    });
  }
}
