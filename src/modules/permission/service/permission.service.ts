import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '@/permission/entity/permission.entity';
import { CreatePermissionRequest, UpdatePermissionRequest } from '@/permission/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { PermissionRepository } from '@/permission/repository/permission.repository';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async create(dto: CreatePermissionRequest, currentUserId: number | null = null): Promise<Permission> {
    const permission = this.permissionRepository.create({
      ...dto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.permissionRepository.save(permission);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Permission[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.permissionRepository.findAllWithPagination(pagination);
    
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission)
      throw new NotFoundException(`Permission with id ${id} not found`);
    return permission;
  }

  async update(dto: UpdatePermissionRequest, currentUserId: number | null = null): Promise<Permission> {
    const permission = await this.findOne(dto.id);
    Object.assign(permission, dto);
    permission.updatedBy = currentUserId;
    return this.permissionRepository.save(permission);
  }

  async softDelete(id: number, currentUserId: number | null = null): Promise<void> {
    const permission = await this.findOne(id);
    permission.deletedBy = currentUserId;
    await this.permissionRepository.save(permission);
    await this.permissionRepository.softRemove(permission);
  }

  async forceDelete(id: number): Promise<void> {
    const result = await this.permissionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
  }
}
