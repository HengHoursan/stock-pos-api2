import { PermissionResponse } from '@/permission/dto';
import { Expose, Exclude, Type } from 'class-transformer';

@Exclude()
export class RolePermissionResponse {
  @Expose()
  roleId: number;

  @Expose()
  permissionId: number;

  @Expose()
  @Type(() => PermissionResponse)
  permission: PermissionResponse;
}
