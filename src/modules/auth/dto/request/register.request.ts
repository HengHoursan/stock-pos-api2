import { IsNotEmpty, IsString, IsEmail, IsNumber } from 'class-validator';

export class RegisterRequest {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  roleId: number;
}
