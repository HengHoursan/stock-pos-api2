import { Controller, Post, Body } from '@nestjs/common';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { RolePermissionService } from '@/role_permission/service/role_permission.service';
import { AssignPermissionsRequest, RevokePermissionsRequest } from '@/role_permission/dto';
import { ApiResponse } from '@/common/dto';

@Controller('role-permissions')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post('assign')
  @Permissions('role:assign-permission')
  async assign(@Body() dto: AssignPermissionsRequest) {
    const result = await this.rolePermissionService.assign(dto);
    return ApiResponse.success(result, 'Permissions assigned successfully');
  }

  @Post('revoke')
  @Permissions('role:revoke-permission')
  async revoke(@Body() dto: RevokePermissionsRequest) {
    await this.rolePermissionService.revoke(dto);
    return ApiResponse.success(null, 'Permissions revoked successfully');
  }

  @Post('list')
  @Permissions('role:view-permission')
  async findByRole(@Body('roleId') roleId: number) {
    const data = await this.rolePermissionService.findByRoleId(roleId);
    return ApiResponse.success(data, 'Role permissions retrieved successfully');
  }
}
