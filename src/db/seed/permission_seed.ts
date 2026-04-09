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
      displayName: 'All User',
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
      displayName: 'All Permission',
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
      displayName: 'All Category',
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
      displayName: 'All Brand',
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
      displayName: 'All Unit',
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
      displayName: 'All Currency',
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
      displayName: 'All Product',
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
      displayName: 'All Supplier',
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
      displayName: 'All Customer',
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
      displayName: 'All Transaction',
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

  // Purchase Quotation Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'purchase_quotation:all',
      displayName: 'All Purchase Quotation',
      group: 'Purchase Quotation Management',
      sort: 1,
    },
    {
      name: 'purchase_quotation:view',
      displayName: 'View Purchase Quotations',
      group: 'Purchase Quotation Management',
      sort: 2,
    },
    {
      name: 'purchase_quotation:create',
      displayName: 'Create Purchase Quotations',
      group: 'Purchase Quotation Management',
      sort: 3,
    },
    {
      name: 'purchase_quotation:update',
      displayName: 'Update Purchase Quotations',
      group: 'Purchase Quotation Management',
      sort: 4,
    },
    {
      name: 'purchase_quotation:delete',
      displayName: 'Delete Purchase Quotations',
      group: 'Purchase Quotation Management',
      sort: 5,
    },
  ]);

  // Purchase Order Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'purchase_order:all',
      displayName: 'All Purchase Order',
      group: 'Purchase Order Management',
      sort: 1,
    },
    {
      name: 'purchase_order:view',
      displayName: 'View Purchase Orders',
      group: 'Purchase Order Management',
      sort: 2,
    },
    {
      name: 'purchase_order:create',
      displayName: 'Create Purchase Orders',
      group: 'Purchase Order Management',
      sort: 3,
    },
    {
      name: 'purchase_order:update',
      displayName: 'Update Purchase Orders',
      group: 'Purchase Order Management',
      sort: 4,
    },
    {
      name: 'purchase_order:delete',
      displayName: 'Delete Purchase Orders',
      group: 'Purchase Order Management',
      sort: 5,
    },
  ]);

  // Sale Order Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'sale_order:all',
      displayName: 'All Sale Order',
      group: 'Sale Order Management',
      sort: 1,
    },
    {
      name: 'sale_order:view',
      displayName: 'View Sale Orders',
      group: 'Sale Order Management',
      sort: 2,
    },
    {
      name: 'sale_order:create',
      displayName: 'Create Sale Orders',
      group: 'Sale Order Management',
      sort: 3,
    },
    {
      name: 'sale_order:update',
      displayName: 'Update Sale Orders',
      group: 'Sale Order Management',
      sort: 4,
    },
    {
      name: 'sale_order:delete',
      displayName: 'Delete Sale Orders',
      group: 'Sale Order Management',
      sort: 5,
    },
  ]);

  // Purchase Invoice Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'purchase_invoice:all',
      displayName: 'All Purchase Invoice',
      group: 'Purchase Invoice Management',
      sort: 1,
    },
    {
      name: 'purchase_invoice:view',
      displayName: 'View Purchase Invoices',
      group: 'Purchase Invoice Management',
      sort: 2,
    },
    {
      name: 'purchase_invoice:create',
      displayName: 'Create Purchase Invoices',
      group: 'Purchase Invoice Management',
      sort: 3,
    },
    {
      name: 'purchase_invoice:update',
      displayName: 'Update Purchase Invoices',
      group: 'Purchase Invoice Management',
      sort: 4,
    },
    {
      name: 'purchase_invoice:delete',
      displayName: 'Delete Purchase Invoices',
      group: 'Purchase Invoice Management',
      sort: 5,
    },
  ]);

  // Sale Invoice Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'sale_invoice:all',
      displayName: 'All Sale Invoice',
      group: 'Sale Invoice Management',
      sort: 1,
    },
    {
      name: 'sale_invoice:view',
      displayName: 'View Sale Invoices',
      group: 'Sale Invoice Management',
      sort: 2,
    },
    {
      name: 'sale_invoice:create',
      displayName: 'Create Sale Invoices',
      group: 'Sale Invoice Management',
      sort: 3,
    },
    {
      name: 'sale_invoice:update',
      displayName: 'Update Sale Invoices',
      group: 'Sale Invoice Management',
      sort: 4,
    },
    {
      name: 'sale_invoice:delete',
      displayName: 'Delete Sale Invoices',
      group: 'Sale Invoice Management',
      sort: 5,
    },
  ]);

  // Sale Quotation Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'sale_quotation:all',
      displayName: 'All Sale Quotation',
      group: 'Sale Quotation Management',
      sort: 1,
    },
    {
      name: 'sale_quotation:view',
      displayName: 'View Sale Quotations',
      group: 'Sale Quotation Management',
      sort: 2,
    },
    {
      name: 'sale_quotation:create',
      displayName: 'Create Sale Quotations',
      group: 'Sale Quotation Management',
      sort: 3,
    },
    {
      name: 'sale_quotation:update',
      displayName: 'Update Sale Quotations',
      group: 'Sale Quotation Management',
      sort: 4,
    },
    {
      name: 'sale_quotation:delete',
      displayName: 'Delete Sale Quotations',
      group: 'Sale Quotation Management',
      sort: 5,
    },
  ]);

  // Sale Payment Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'sale_payment:all',
      displayName: 'All Sale Payment',
      group: 'Sale Payment Management',
      sort: 1,
    },
    {
      name: 'sale_payment:view',
      displayName: 'View Sale Payments',
      group: 'Sale Payment Management',
      sort: 2,
    },
    {
      name: 'sale_payment:create',
      displayName: 'Create Sale Payments',
      group: 'Sale Payment Management',
      sort: 3,
    },
    {
      name: 'sale_payment:update',
      displayName: 'Update Sale Payments',
      group: 'Sale Payment Management',
      sort: 4,
    },
    {
      name: 'sale_payment:delete',
      displayName: 'Delete Sale Payments',
      group: 'Sale Payment Management',
      sort: 5,
    },
  ]);

  // Sale Return Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'sale_return:all',
      displayName: 'All Sale Return',
      group: 'Sale Return Management',
      sort: 1,
    },
    {
      name: 'sale_return:view',
      displayName: 'View Sale Returns',
      group: 'Sale Return Management',
      sort: 2,
    },
    {
      name: 'sale_return:create',
      displayName: 'Create Sale Returns',
      group: 'Sale Return Management',
      sort: 3,
    },
    {
      name: 'sale_return:update',
      displayName: 'Update Sale Returns',
      group: 'Sale Return Management',
      sort: 4,
    },
    {
      name: 'sale_return:delete',
      displayName: 'Delete Sale Returns',
      group: 'Sale Return Management',
      sort: 5,
    },
  ]);

  // Purchase Payment Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'purchase_payment:all',
      displayName: 'All Purchase Payment',
      group: 'Purchase Payment Management',
      sort: 1,
    },
    {
      name: 'purchase_payment:view',
      displayName: 'View Purchase Payments',
      group: 'Purchase Payment Management',
      sort: 2,
    },
    {
      name: 'purchase_payment:create',
      displayName: 'Create Purchase Payments',
      group: 'Purchase Payment Management',
      sort: 3,
    },
    {
      name: 'purchase_payment:update',
      displayName: 'Update Purchase Payments',
      group: 'Purchase Payment Management',
      sort: 4,
    },
    {
      name: 'purchase_payment:delete',
      displayName: 'Delete Purchase Payments',
      group: 'Purchase Payment Management',
      sort: 5,
    },
  ]);

  // Purchase Return Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'purchase_return:all',
      displayName: 'All Purchase Return',
      group: 'Purchase Return Management',
      sort: 1,
    },
    {
      name: 'purchase_return:view',
      displayName: 'View Purchase Returns',
      group: 'Purchase Return Management',
      sort: 2,
    },
    {
      name: 'purchase_return:create',
      displayName: 'Create Purchase Returns',
      group: 'Purchase Return Management',
      sort: 3,
    },
    {
      name: 'purchase_return:update',
      displayName: 'Update Purchase Returns',
      group: 'Purchase Return Management',
      sort: 4,
    },
    {
      name: 'purchase_return:delete',
      displayName: 'Delete Purchase Returns',
      group: 'Purchase Return Management',
      sort: 5,
    },
  ]);

  // Discount Management
  await seedPermissionsByGroup(dataSource, [
    {
      name: 'discount:all',
      displayName: 'All Discount',
      group: 'Discount Management',
      sort: 1,
    },
    {
      name: 'discount:view',
      displayName: 'View Discounts',
      group: 'Discount Management',
      sort: 2,
    },
    {
      name: 'discount:create',
      displayName: 'Create Discounts',
      group: 'Discount Management',
      sort: 3,
    },
    {
      name: 'discount:update',
      displayName: 'Update Discounts',
      group: 'Discount Management',
      sort: 4,
    },
    {
      name: 'discount:delete',
      displayName: 'Delete Discounts',
      group: 'Discount Management',
      sort: 5,
    },
  ]);

  console.log('✅ Permissions seeded and updated by group');
};
