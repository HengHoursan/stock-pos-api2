import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscountRequest } from './create_discount.request';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateDiscountRequest extends PartialType(CreateDiscountRequest) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
