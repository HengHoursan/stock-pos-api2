import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class AssignPermissionsRequest {
  @IsNotEmpty()
  @IsNumber()
  roleId: number;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
