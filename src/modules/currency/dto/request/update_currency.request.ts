import { PartialType } from '@nestjs/mapped-types';
import { CreateCurrencyRequest } from './create_currency.request';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateCurrencyRequest extends PartialType(CreateCurrencyRequest) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
