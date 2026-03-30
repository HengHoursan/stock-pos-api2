import { Injectable } from '@nestjs/common';
import { DataSource, Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from '../entity/user.entity';
import { PaginationRequest } from '@/common/dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByIdWithRole(id: number): Promise<User | null> {
    return this.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async findByUsernameWithPermissions(username: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'permission')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findByEmailWithPermissions(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'permission')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByIdWithPermissions(id: number): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'permission')
      .where('user.id = :id', { id })
      .getOne();
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[User[], number]> {
    const { page, limit, sortBy, sortOrder, search, filter } = pagination;

    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};

    if (search && search.trim() !== '') {
      where = [
        { username: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
      ];
    }

    if (filter && filter !== 'all') {
      const statusValue = filter === 'active';
      if (Array.isArray(where)) {
        where = where.map((condition) => ({ ...condition, status: statusValue }));
      } else {
        where.status = statusValue;
      }
    }

    return this.findAndCount({
      where,
      relations: ['role'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
  }
}
