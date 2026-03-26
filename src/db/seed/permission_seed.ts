import { DataSource } from 'typeorm';
import { Permission } from '../../modules/permission/entity/permission.entity';

export const seedPermissions = async (dataSource: DataSource) => {
  const repository = dataSource.getRepository(Permission);

  const permissions = [
    // User Management
    { name: 'user:read', displayName: 'View Users', group: 'User Management', sort: 1 },
    { name: 'user:create', displayName: 'Create Users', group: 'User Management', sort: 2 },
    { name: 'user:update', displayName: 'Update Users', group: 'User Management', sort: 3 },
    { name: 'user:delete', displayName: 'Delete Users', group: 'User Management', sort: 4 },

    // Role Management
    { name: 'role:read', displayName: 'View Roles', group: 'Role Management', sort: 5 },
    { name: 'role:create', displayName: 'Create Roles', group: 'Role Management', sort: 6 },
    { name: 'role:update', displayName: 'Update Roles', group: 'Role Management', sort: 7 },
    { name: 'role:delete', displayName: 'Delete Roles', group: 'Role Management', sort: 8 },

    // Permission Management
    { name: 'permission:read', displayName: 'View Permissions', group: 'Permission Management', sort: 9 },
    { name: 'permission:create', displayName: 'Create Permissions', group: 'Permission Management', sort: 10 },
    { name: 'permission:update', displayName: 'Update Permissions', group: 'Permission Management', sort: 11 },
    { name: 'permission:delete', displayName: 'Delete Permissions', group: 'Permission Management', sort: 12 },

    // Role-Permission Assignment
    { name: 'role-permission:assign', displayName: 'Assign Permissions', group: 'Access Control', sort: 13 },
    { name: 'role-permission:revoke', displayName: 'Revoke Permissions', group: 'Access Control', sort: 14 },
  ];

  for (const p of permissions) {
    const exists = await repository.findOne({ where: { name: p.name } });
    if (!exists) {
      await repository.save(repository.create(p));
    } else {
      // Update existing permissions to have the new fields
      exists.displayName = p.displayName;
      exists.group = p.group;
      exists.sort = p.sort;
      await repository.save(exists);
    }
  }

  console.log('✅ Permissions seeded and updated');
};
