import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdatePermissionRequest {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsNumber()
  sort?: number;
}
