import { DataSource } from 'typeorm';
import { User } from '../src/modules/user/entity/user.entity';
import { Role } from '../src/modules/role/entity/role.entity';
import { Permission } from '../src/modules/permission/entity/permission.entity';
import { RolePermission } from '../src/modules/role_permission/entity/role_permission.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function check() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'stock_pos',
    entities: [User, Role, Permission, RolePermission],
    synchronize: false,
  });

  await dataSource.initialize();

  const users = await dataSource.getRepository(User).find({
    relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
  });

  users.forEach(user => {
    console.log(`User: ${user.username}, Role: ${user.role?.name}`);
    const perms = user.role?.rolePermissions?.map(rp => rp.permission?.name).filter(Boolean) || [];
    console.log(`Permissions (${perms.length}): ${perms.join(', ')}`);
    console.log('-------------------');
  });

  await dataSource.destroy();
}

check();
