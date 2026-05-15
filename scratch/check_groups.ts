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

  const groups = await dataSource.getRepository(Permission)
    .createQueryBuilder('p')
    .select('DISTINCT(p.group)', 'group')
    .getRawMany();

  console.log('Unique Groups in DB:');
  groups.forEach(g => console.log(`- "${g.group}"`));

  await dataSource.destroy();
}

check();
