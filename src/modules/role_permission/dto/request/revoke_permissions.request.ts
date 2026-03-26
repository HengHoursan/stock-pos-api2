import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class RevokePermissionsRequest {
  @IsNotEmpty()
  @IsNumber()
  roleId: number;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
