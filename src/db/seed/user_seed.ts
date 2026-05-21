import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entity/user.entity';
import { Role } from '../../modules/role/entity/role.entity';
import * as bcrypt from 'bcrypt';

export const seedUsers = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const getRole = async (name: string): Promise<Role | null> => {
    return await roleRepo.findOne({ where: { name } });
  };

  const superAdminRole = await getRole('superadmin');
  const adminRole = await getRole('admin');
  const cashierRole = await getRole('cashier');

  if (!superAdminRole || !adminRole || !cashierRole) {
    console.error('❌ Required roles not found. Run role seeding first.');
    return;
  }

  const usersToSeed = [
    {
      username: 'superadmin',
      email: 'superadmin@gmail.com',
      plainPassword: 'superadmin123',
      role: superAdminRole,
    },
    {
      username: 'admin',
      email: 'admin@gmail.com',
      plainPassword: 'admin123',
      role: adminRole,
    },
    {
      username: 'cashier1',
      email: 'cashier1@gmail.com',
      plainPassword: 'cashier123',
      role: cashierRole,
    },
    {
      username: 'cashier2',
      email: 'cashier2@gmail.com',
      plainPassword: 'cashier123',
      role: cashierRole,
    },
    {
      username: 'cashier3',
      email: 'cashier3@gmail.com',
      plainPassword: 'cashier123',
      role: cashierRole,
    },
  ];

  for (const data of usersToSeed) {
    const user = await userRepo.findOne({
      where: { username: data.username },
    });

    const hashedPassword = await bcrypt.hash(data.plainPassword, 10);

    if (!user) {
      const newUser = userRepo.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      });
      await userRepo.save(newUser);
      console.log(
        `✅ User created: ${data.username} (password: ${data.plainPassword})`,
      );
    } else {
      // Update role, email and reset password to match seed
      user.role = data.role;
      user.email = data.email;
      user.password = hashedPassword;
      await userRepo.save(user);
      console.log(
        `✅ User updated: ${data.username} (password reset to: ${data.plainPassword})`,
      );
    }
  }

  console.log('🏁 User seeding completed');
};
