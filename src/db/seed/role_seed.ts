import { DataSource } from 'typeorm';
import { Role } from '../../modules/role/entity/role.entity';
import { Permission } from '../../modules/permission/entity/permission.entity';
import { RolePermission } from '../../modules/role_permission/entity/role_permission.entity';

export const seedRoles = async (dataSource: DataSource) => {
  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);

  const roles = [
    { name: 'Super Admin' },
    { name: 'Admin' },
    { name: 'User' },
  ];

  for (const r of roles) {
    let role = await roleRepo.findOne({ where: { name: r.name } });
    if (!role) {
      role = await roleRepo.save(roleRepo.create(r));
    }

    // Assign all permissions to Super Admin
    if (role.name === 'Super Admin') {
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
