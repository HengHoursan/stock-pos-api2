import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsObject,
  Max,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PaginationRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsObject()
  filter?: Record<string, string>;

  @IsOptional()
  @IsString()
  sortBy: string = 'id';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase() || 'DESC')
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}
