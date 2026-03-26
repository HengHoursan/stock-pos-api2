import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRoleRequest {
  @IsNotEmpty()
  @IsString()
  name: string;
}
