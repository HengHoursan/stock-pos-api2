import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/user/entity/user.entity';
import { CreateUserRequest, UpdateUserRequest } from '@/user/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { UserRepository } from '@/user/repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async create(dto: CreateUserRequest, currentUserId: number | null = null): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      role: { id: dto.roleId } as any,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.userRepository.save(user);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[User[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.userRepository.findAllWithPagination(pagination);
    
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findByIdWithRole(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async getProfile(id: number): Promise<User> {
    const user = await this.userRepository.findByIdWithPermissions(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsernameWithPermissions(username);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmailWithPermissions(email);
  }

  async update(dto: UpdateUserRequest, currentUserId: number | null = null): Promise<User> {
    const user = await this.findOne(dto.id);
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.username) user.username = dto.username;
    if (dto.email) user.email = dto.email;
    if (dto.roleId) user.role = { id: dto.roleId } as any;

    user.updatedBy = currentUserId;

    return this.userRepository.save(user);
  }



  async softDelete(id: number, currentUserId: number | null = null): Promise<void> {
    const user = await this.findOne(id);
    user.deletedBy = currentUserId;
    await this.userRepository.save(user);
    await this.userRepository.softRemove(user);
  }

  async forceDelete(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
