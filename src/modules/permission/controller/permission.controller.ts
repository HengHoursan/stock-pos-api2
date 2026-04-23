import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { PermissionService } from '@/permission/service/permission.service';
import {
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionResponse,
} from '@/permission/dto';
import {
  PaginationRequest,
  ApiResponse,
  PaginationResponse,
  IdRequest,
} from '@/common/dto';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('create')
  @Permissions('permission:create')
  async create(
    @Body() dto: CreatePermissionRequest,
    @CurrentUser('id') userId: number,
  ) {
    const permission = await this.permissionService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(PermissionResponse, permission),
      'Permission created successfully',
    );
  }

  @Post('all')
  @Permissions('permission:view')
  async all() {
    const permissions = await this.permissionService.findAll();
    return ApiResponse.success(
      plainToInstance(PermissionResponse, permissions),
      'Permission list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('permission:view')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.permissionService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(PermissionResponse, data), meta),
      'Permission list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('permission:view')
  async detail(@Body() dto: IdRequest) {
    const permission = await this.permissionService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(PermissionResponse, permission),
      'Permission detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('permission:update')
  async update(
    @Body() dto: UpdatePermissionRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.permissionService.update(dto, userId);
    return ApiResponse.success(null, 'Permission updated successfully');
  }

  @Post('soft-delete')
  @Permissions('permission:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.permissionService.softDelete(dto.id, userId);
    return ApiResponse.success(null, 'Permission soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('permission:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.permissionService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Permission permanently deleted');
  }
}
