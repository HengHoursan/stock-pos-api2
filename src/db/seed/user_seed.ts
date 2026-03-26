import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entity/user.entity';
import { Role } from '../../modules/role/entity/role.entity';
import * as bcrypt from 'bcrypt';

export const seedUsers = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const superAdminRole = await roleRepo.findOne({ where: { name: 'Super Admin' } });
  if (!superAdminRole) {
    console.error('Super Admin role not found. Skipping user seeding.');
    return;
  }

  const superAdmin = {
    username: 'superadmin',
    email: 'admin@gmail.com',
    password: await bcrypt.hash('admin@123', 10),
    roleId: superAdminRole.id,
  };

  const exists = await userRepo.findOne({ where: { username: superAdmin.username } });
  if (!exists) {
    await userRepo.save(userRepo.create(superAdmin));
    console.log('✅ Super Admin user seeded (superadmin / admin@123)');
  } else {
    console.log('ℹ️ Super Admin user already exists');
  }
};
