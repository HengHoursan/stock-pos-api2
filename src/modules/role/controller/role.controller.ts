import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current-user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { RoleService } from '@/role/service/role.service';
import { CreateRoleRequest, UpdateRoleRequest, RoleResponse } from '@/role/dto';
import { PaginationRequest, ApiResponse, PaginationResponse } from '@/common/dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  @Permissions('role:create')
  async create(
    @Body() dto: CreateRoleRequest,
    @CurrentUser('id') userId: number,
  ) {
    const role = await this.roleService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(RoleResponse, role),
      'Role created successfully',
    );
  }

  @Post('all')
  @Permissions('role:view')
  async all() {
    const roles = await this.roleService.findAll();
    return ApiResponse.success(
      plainToInstance(RoleResponse, roles),
      'Role list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('role:view')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.roleService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(RoleResponse, data), meta),
      'Role list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('role:view')
  async detail(@Body('id') id: number) {
    const role = await this.roleService.findOne(id);
    return ApiResponse.success(
      plainToInstance(RoleResponse, role),
      'Role detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('role:update')
  async update(
    @Body() dto: UpdateRoleRequest,
    @CurrentUser('id') userId: number,
  ) {
    const role = await this.roleService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(RoleResponse, role),
      'Role updated successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('role:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.roleService.softDelete(id, userId);
    return ApiResponse.success(null, 'Role soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('role:delete')
  async forceDelete(@Body('id') id: number) {
    await this.roleService.forceDelete(id);
    return ApiResponse.success(null, 'Role permanently deleted');
  }
}
