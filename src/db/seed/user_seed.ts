import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entity/user.entity';
import { Role } from '../../modules/role/entity/role.entity';
import * as bcrypt from 'bcrypt';

export const seedUsers = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const superAdminRole = await roleRepo.findOne({
    where: { name: 'superadmin' },
  });
  if (!superAdminRole) {
    console.error('Super Admin role not found. Skipping user seeding.');
    return;
  }

  const superAdminData = {
    username: 'superadmin',
    email: 'superadmin@gmail.com',
    password: await bcrypt.hash('superadmin123', 10),
    role: superAdminRole,
  };

  let user = await userRepo.findOne({
    where: { username: superAdminData.username },
  });

  if (!user) {
    user = await userRepo.save(userRepo.create(superAdminData));
    console.log('✅ Super Admin user created (superadmin / admin@123)');
  } else {
    // Force update role to ensure it's correct
    user.role = superAdminRole;
    user.email = superAdminData.email;
    await userRepo.save(user);
    console.log('✅ Super Admin user role refreshed');
  }
};
