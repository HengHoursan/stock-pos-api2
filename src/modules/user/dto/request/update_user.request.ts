import { IsOptional, IsString, IsEmail, IsNumber } from 'class-validator';

export class UpdateUserRequest {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  roleId?: number;
}
