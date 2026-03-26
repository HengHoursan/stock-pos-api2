import { DataSource } from 'typeorm';
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
    { name: 'user', displayName: 'Regular User' },
  ];

  for (const r of roles) {
    let role = await roleRepo.findOne({ where: { name: r.name } });
    if (!role) {
      role = await roleRepo.save(roleRepo.create(r));
    } else {
      // Update display name if it changed
      role.displayName = r.displayName;
      role.name = r.name;
      await roleRepo.save(role);
    }

    // Assign all permissions to Super Admin
    if (role.name === 'superadmin') {
      const allPermissions = await permissionRepo.find();
      for (const p of allPermissions) {
        const rolePermissionExists = await rolePermissionRepo.findOne({
          where: { roleId: role.id, permissionId: p.id },
        });

        if (!rolePermissionExists) {
          await rolePermissionRepo.save(
            rolePermissionRepo.create({
              roleId: role.id,
              permissionId: p.id,
            }),
          );
        }
      }
    }
  }

  console.log('✅ Roles and Role-Permissions seeded');
};
