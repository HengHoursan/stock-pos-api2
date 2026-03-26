import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entity/user.entity';

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
    return this.findOne({
      where: { username },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });
  }

  async findByEmailWithPermissions(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });
  }
}
