import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/role/entity/role.entity';
import { CreateRoleRequest, UpdateRoleRequest } from '@/role/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { RoleRepository } from '@/role/repository/role.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
  ) {}

  async create(dto: CreateRoleRequest, currentUserId: number | null = null): Promise<Role> {
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
    const [data, total] = await this.roleRepository.findAllWithPagination(pagination);
    
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

  async update(dto: UpdateRoleRequest, currentUserId: number | null = null): Promise<Role> {
    const role = await this.findOne(dto.id);
    Object.assign(role, dto);
    role.updatedBy = currentUserId;
    return this.roleRepository.save(role);
  }

  async softDelete(id: number, currentUserId: number | null = null): Promise<void> {
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
}
