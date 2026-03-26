import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateRoleRequest {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;
}
