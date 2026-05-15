import { DataSource, In, Not } from 'typeorm';
import { Role } from '../../modules/role/entity/role.entity';
import { Permission } from '../../modules/permission/entity/permission.entity';
import { RolePermission } from '../../modules/role_permission/entity/role_permission.entity';

export const seedRoles = async (dataSource: DataSource) => {
  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);

  const roles = [
    { name: 'superadmin', displayName: 'Super Admin' },
    { name: 'admin', displayName: 'Administrator' },
    { name: 'cashier', displayName: 'Cashier' },
  ];

  for (const r of roles) {
    let role = await roleRepo.findOne({ where: { name: r.name } });
    if (!role) {
      role = await roleRepo.save(roleRepo.create(r));
    } else {
      role.displayName = r.displayName;
      role.name = r.name;
      await roleRepo.save(role);
    }

    // Assign permissions based on role
    let permissionsToAssign: Permission[] = [];

    if (role.name === 'superadmin') {
      // Super Admin gets everything
      permissionsToAssign = await permissionRepo.find();
    } else if (role.name === 'admin') {
      // Admin gets everything EXCEPT Access Control and User/Role/Permission management
      permissionsToAssign = await permissionRepo.find({
        where: {
          group: Not(
            In([
              'User Management',
              'Role Management',
              'Permission Management',
              'Access Control',
            ]),
          ),
        },
      });
    } else if (role.name === 'cashier') {
      // Cashier gets POS and Sales related permissions
      permissionsToAssign = await permissionRepo.find({
        where: [
          { name: In(['customer:view', 'customer:all']) },
          { group: 'Sale Order Management' },
          { group: 'Sale Invoice Management' },
          { group: 'Sale Payment Management' },
          { group: 'Sale Return Management' },
          { group: 'Sale Quotation Management' },
          { group: 'Transaction Management' },
          { name: In(['product:all', 'product:view']) },
          {
            name: In([
              'category:all',
              'category:view',
              'brand:all',
              'brand:view',
              'unit:all',
              'unit:view',
              'discount:all',
              'discount:view',
              'currency:all',
            ]),
          },
        ],
      });
    }

    // Sync role-permissions
    for (const p of permissionsToAssign) {
      const exists = await rolePermissionRepo.findOne({
        where: { roleId: role.id, permissionId: p.id },
      });

      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            roleId: role.id,
            permissionId: p.id,
          }),
        );
      }
    }

    // Clean up old permissions if necessary (optional, but good for seed consistency)
    const currentPermissionIds = permissionsToAssign.map((p) => p.id);
    if (currentPermissionIds.length > 0) {
      await rolePermissionRepo.delete({
        roleId: role.id,
        permissionId: Not(In(currentPermissionIds)),
      });
    }
  }

  console.log('✅ Roles and Role-Permissions seeded');
};
