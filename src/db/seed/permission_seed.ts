import { DataSource } from 'typeorm';
import { Permission } from '../../modules/permission/entity/permission.entity';

/**
 * Helper to seed permissions by group
 */
const seedPermissionsByGroup = async (
  dataSource: DataSource,
  permissions: Partial<Permission>[],
) => {
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
    {
      name: 'user:all',
      displayName: 'All User Permissions',
      group: 'User Management',
      sort: 1,
    },
    {
      name: 'user:view',
      displayName: 'View Users',
      group: 'User Management',
      sort: 2,
    },
    {
      name: 'user:create',
      displayName: 'Create Users',
      group: 'User Management',
      sort: 3,
    },
    {
      name: 'user:update',
      displayName: 'Update Users',
      group: 'User Management',
      sort: 4,
    },
    {
      name: 'user:delete',
      displayName: 'Delete Users',
      group: 'User Management',
      sort: 5,
    },
  ]);

  // Role Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'role:all',
      displayName: 'All Role Permissions',
      group: 'Role Management',
      sort: 1,
    },
    {
      name: 'role:view',
      displayName: 'View Roles',
      group: 'Role Management',
      sort: 2,
    },
    {
      name: 'role:create',
      displayName: 'Create Roles',
      group: 'Role Management',
      sort: 3,
    },
    {
      name: 'role:update',
      displayName: 'Update Roles',
      group: 'Role Management',
      sort: 4,
    },
    {
      name: 'role:delete',
      displayName: 'Delete Roles',
      group: 'Role Management',
      sort: 5,
    },
  ]);

  // Permission Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'permission:all',
      displayName: 'All Permission Settings',
      group: 'Permission Management',
      sort: 1,
    },
    {
      name: 'permission:view',
      displayName: 'View Permissions',
      group: 'Permission Management',
      sort: 2,
    },
    {
      name: 'permission:create',
      displayName: 'Create Permissions',
      group: 'Permission Management',
      sort: 3,
    },
    {
      name: 'permission:update',
      displayName: 'Update Permissions',
      group: 'Permission Management',
      sort: 4,
    },
    {
      name: 'permission:delete',
      displayName: 'Delete Permissions',
      group: 'Permission Management',
      sort: 5,
    },
  ]);

  // Role-Permission Assignment
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'role:assign-permission',
      displayName: 'Assign Permissions',
      group: 'Access Control',
      sort: 1,
    },
    {
      name: 'role:revoke-permission',
      displayName: 'Revoke Permissions',
      group: 'Access Control',
      sort: 2,
    },
    {
      name: 'role:all-permssion',
      displayName: 'All Role Permissions',
      group: 'Access Control',
      sort: 3,
    },
    {
      name: 'role:view-permission',
      displayName: 'View Role Permissions',
      group: 'Access Control',
      sort: 4,
    },
  ]);

  // Category Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'category:all',
      displayName: 'All Category Permissions',
      group: 'Category Management',
      sort: 1,
    },
    {
      name: 'category:view',
      displayName: 'View Categories',
      group: 'Category Management',
      sort: 2,
    },
    {
      name: 'category:create',
      displayName: 'Create Categories',
      group: 'Category Management',
      sort: 3,
    },
    {
      name: 'category:update',
      displayName: 'Update Categories',
      group: 'Category Management',
      sort: 4,
    },
    {
      name: 'category:delete',
      displayName: 'Delete Categories',
      group: 'Category Management',
      sort: 5,
    },
  ]);

  // Brand Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'brand:all',
      displayName: 'All Brand Permissions',
      group: 'Brand Management',
      sort: 1,
    },
    {
      name: 'brand:view',
      displayName: 'View Brands',
      group: 'Brand Management',
      sort: 2,
    },
    {
      name: 'brand:create',
      displayName: 'Create Brands',
      group: 'Brand Management',
      sort: 3,
    },
    {
      name: 'brand:update',
      displayName: 'Update Brands',
      group: 'Brand Management',
      sort: 4,
    },
    {
      name: 'brand:delete',
      displayName: 'Delete Brands',
      group: 'Brand Management',
      sort: 5,
    },
  ]);

  // Unit Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'unit:all',
      displayName: 'All Unit Permissions',
      group: 'Unit Management',
      sort: 1,
    },
    {
      name: 'unit:view',
      displayName: 'View Units',
      group: 'Unit Management',
      sort: 2,
    },
    {
      name: 'unit:create',
      displayName: 'Create Units',
      group: 'Unit Management',
      sort: 3,
    },
    {
      name: 'unit:update',
      displayName: 'Update Units',
      group: 'Unit Management',
      sort: 4,
    },
    {
      name: 'unit:delete',
      displayName: 'Delete Units',
      group: 'Unit Management',
      sort: 5,
    },
  ]);

  // Currency Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'currency:all',
      displayName: 'All Currency Permissions',
      group: 'Currency Management',
      sort: 1,
    },
    {
      name: 'currency:view',
      displayName: 'View Currencies',
      group: 'Currency Management',
      sort: 2,
    },
    {
      name: 'currency:create',
      displayName: 'Create Currencies',
      group: 'Currency Management',
      sort: 3,
    },
    {
      name: 'currency:update',
      displayName: 'Update Currencies',
      group: 'Currency Management',
      sort: 4,
    },
    {
      name: 'currency:delete',
      displayName: 'Delete Currencies',
      group: 'Currency Management',
      sort: 5,
    },
  ]);

  // Product Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'product:all',
      displayName: 'All Product Permissions',
      group: 'Product Management',
      sort: 1,
    },
    {
      name: 'product:list',
      displayName: 'List Products',
      group: 'Product Management',
      sort: 2,
    },
    {
      name: 'product:view',
      displayName: 'View Product Details',
      group: 'Product Management',
      sort: 3,
    },
    {
      name: 'product:create',
      displayName: 'Create Products',
      group: 'Product Management',
      sort: 4,
    },
    {
      name: 'product:update',
      displayName: 'Update Products',
      group: 'Product Management',
      sort: 5,
    },
    {
      name: 'product:status-update',
      displayName: 'Update Product Status',
      group: 'Product Management',
      sort: 6,
    },
    {
      name: 'product:delete',
      displayName: 'Delete Products',
      group: 'Product Management',
      sort: 7,
    },
  ]);

  // Supplier Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'supplier:all',
      displayName: 'All Supplier Permissions',
      group: 'Supplier Management',
      sort: 1,
    },
    {
      name: 'supplier:view',
      displayName: 'View Suppliers',
      group: 'Supplier Management',
      sort: 2,
    },
    {
      name: 'supplier:create',
      displayName: 'Create Suppliers',
      group: 'Supplier Management',
      sort: 3,
    },
    {
      name: 'supplier:update',
      displayName: 'Update Suppliers',
      group: 'Supplier Management',
      sort: 4,
    },
    {
      name: 'supplier:delete',
      displayName: 'Delete Suppliers',
      group: 'Supplier Management',
      sort: 5,
    },
  ]);

  // Customer Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'customer:all',
      displayName: 'All Customer Permissions',
      group: 'Customer Management',
      sort: 1,
    },
    {
      name: 'customer:view',
      displayName: 'View Customers',
      group: 'Customer Management',
      sort: 2,
    },
    {
      name: 'customer:create',
      displayName: 'Create Customers',
      group: 'Customer Management',
      sort: 3,
    },
    {
      name: 'customer:update',
      displayName: 'Update Customers',
      group: 'Customer Management',
      sort: 4,
    },
    {
      name: 'customer:delete',
      displayName: 'Delete Customers',
      group: 'Customer Management',
      sort: 5,
    },
  ]);

  await seedPermissionsByGroup(dataSource, [
    {
      name: 'transaction:all',
      displayName: 'All Transaction Permissions',
      group: 'Transaction Management',
      sort: 1,
    },
    {
      name: 'transaction:view',
      displayName: 'View Transactions',
      group: 'Transaction Management',
      sort: 2,
    },
    {
      name: 'transaction:create',
      displayName: 'Create Transactions',
      group: 'Transaction Management',
      sort: 3,
    },
    {
      name: 'transaction:update',
      displayName: 'Update Transactions',
      group: 'Transaction Management',
      sort: 4,
    },
    {
      name: 'transaction:delete',
      displayName: 'Delete Transactions',
      group: 'Transaction Management',
      sort: 5,
    },
  ]);

  console.log('✅ Permissions seeded and updated by group');
};
