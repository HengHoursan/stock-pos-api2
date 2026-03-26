import { DataSource } from 'typeorm';
import { Permission } from '../../modules/permission/entity/permission.entity';

/**
 * Helper to seed permissions by group
 */
const seedPermissionsByGroup = async (dataSource: DataSource, permissions: Partial<Permission>[]) => {
  const repository = dataSource.getRepository(Permission);

  for (const p of permissions) {
    const exists = await repository.findOne({ where: { name: p.name } });
    if (!exists) {
      await repository.save(repository.create(p));
    } else {
      exists.displayName = p.displayName!;
      exists.group = p.group!;
      exists.sort = p.sort!;
      await repository.save(exists);
    }
  }
};

export const seedPermissions = async (dataSource: DataSource) => {
  // User Management
  await seedPermissionsByGroup(dataSource, [
    { name: 'user:all', displayName: 'All User Permissions', group: 'User Management', sort: 1 },
    { name: 'user:view', displayName: 'View Users', group: 'User Management', sort: 2 },
    { name: 'user:create', displayName: 'Create Users', group: 'User Management', sort: 3 },
    { name: 'user:update', displayName: 'Update Users', group: 'User Management', sort: 4 },
    { name: 'user:delete', displayName: 'Delete Users', group: 'User Management', sort: 5 },
  ]);

  // Role Management
  await seedPermissionsByGroup(dataSource, [
    { name: 'role:all', displayName: 'All Role Permissions', group: 'Role Management', sort: 1 },
    { name: 'role:view', displayName: 'View Roles', group: 'Role Management', sort: 2 },
    { name: 'role:create', displayName: 'Create Roles', group: 'Role Management', sort: 3 },
    { name: 'role:update', displayName: 'Update Roles', group: 'Role Management', sort: 4 },
    { name: 'role:delete', displayName: 'Delete Roles', group: 'Role Management', sort: 5 },
  ]);

  // Permission Management
  await seedPermissionsByGroup(dataSource, [
    { name: 'permission:all', displayName: 'All Permission Settings', group: 'Permission Management', sort: 1 },
    { name: 'permission:view', displayName: 'View Permissions', group: 'Permission Management', sort: 2 },
    { name: 'permission:create', displayName: 'Create Permissions', group: 'Permission Management', sort: 3 },
    { name: 'permission:update', displayName: 'Update Permissions', group: 'Permission Management', sort: 4 },
    { name: 'permission:delete', displayName: 'Delete Permissions', group: 'Permission Management', sort: 5 },
  ]);

  // Role-Permission Assignment
  await seedPermissionsByGroup(dataSource, [
    { name: 'role:assign-permission', displayName: 'Assign Permissions', group: 'Access Control', sort: 1 },
    { name: 'role:revoke-permission', displayName: 'Revoke Permissions', group: 'Access Control', sort: 2 },
    { name: 'role:view-permission', displayName: 'View Role Permissions', group: 'Access Control', sort: 3 },
  ]);

  // Category Management
  await seedPermissionsByGroup(dataSource, [
    { name: 'category:all', displayName: 'All Category Permissions', group: 'Category Management', sort: 1 },
    { name: 'category:view', displayName: 'View Categories', group: 'Category Management', sort: 2 },
    { name: 'category:create', displayName: 'Create Categories', group: 'Category Management', sort: 3 },
    { name: 'category:update', displayName: 'Update Categories', group: 'Category Management', sort: 4 },
    { name: 'category:delete', displayName: 'Delete Categories', group: 'Category Management', sort: 5 },
    { name: 'category:status-update', displayName: 'Update Category Status', group: 'Category Management', sort: 6 },
  ]);

  // Brand Management
  await seedPermissionsByGroup(dataSource, [
    { name: 'brand:all', displayName: 'All Brand Permissions', group: 'Brand Management', sort: 1 },
    { name: 'brand:view', displayName: 'View Brands', group: 'Brand Management', sort: 2 },
    { name: 'brand:create', displayName: 'Create Brands', group: 'Brand Management', sort: 3 },
    { name: 'brand:update', displayName: 'Update Brands', group: 'Brand Management', sort: 4 },
    { name: 'brand:delete', displayName: 'Delete Brands', group: 'Brand Management', sort: 5 },
    { name: 'brand:status-update', displayName: 'Update Brand Status', group: 'Brand Management', sort: 6 },
  ]);

  console.log('✅ Permissions seeded and updated by group');
};
