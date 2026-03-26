import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionController } from './controller/permission.controller';
import { PermissionService } from './service/permission.service';
import { Permission } from './entity/permission.entity';
import { PermissionRepository } from './repository/permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionService, PermissionRepository],
})
export class PermissionModule {}
