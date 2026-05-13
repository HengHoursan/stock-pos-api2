import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class ResetPasswordRequest {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
