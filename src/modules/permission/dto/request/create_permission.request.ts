import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePermissionRequest {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  group?: string;

  @IsOptional()
  @IsNumber()
  sort?: number;
}
