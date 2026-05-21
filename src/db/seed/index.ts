import { DataSource } from 'typeorm';
import { seedPermissions } from './permission_seed';
import { seedRoles } from './role_seed';
import { seedUsers } from './user_seed';
import { seedData } from './data_seed';

export const runSeeds = async (dataSource: DataSource) => {
  console.log('🚀 Starting Seeding...');

  // Step 1 – Core access-control seeds (permissions → roles → users)
  await seedPermissions(dataSource);
  await seedRoles(dataSource);
  await seedUsers(dataSource);

  // Step 2 – Business data seeds (categories → products → invoices → transactions)
  await seedData(dataSource);

  console.log('🏁 Seeding Completed!');
};
