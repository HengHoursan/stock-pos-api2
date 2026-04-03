import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { CustomerType } from '../../../../common/enum/customer_type.enum';

export class CreateCustomerRequest {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameLatin?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CustomerType)
  @IsNotEmpty()
  type: CustomerType;

  @IsBoolean()
  @IsOptional()
  status?: boolean = true;
}
