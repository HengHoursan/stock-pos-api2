import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitRequest } from './create_unit.request';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateUnitRequest extends PartialType(CreateUnitRequest) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
