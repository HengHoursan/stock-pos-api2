import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionController } from './controller/role_permission.controller';
import { RolePermissionService } from './service/role_permission.service';
import { RolePermission } from './entity/role_permission.entity';
import { RolePermissionRepository } from './repository/role_permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RolePermission])],
  controllers: [RolePermissionController],
  providers: [RolePermissionService, RolePermissionRepository],
  exports: [RolePermissionService, RolePermissionRepository],
})
export class RolePermissionModule {}
