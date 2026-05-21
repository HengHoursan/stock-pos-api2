import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateProfileRequest {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(60)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  photo?: string;
}
