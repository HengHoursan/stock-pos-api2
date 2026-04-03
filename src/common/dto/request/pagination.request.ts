import { IsOptional, IsInt, Min, IsString, IsObject, Max } from 'class-validator';
import { Type } from 'class-transformer';

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

  /**
   * Filter as a key-value object (e.g. { "status": "active", "categoryId": "12" })
   */
  @IsOptional()
  @IsObject()
  filter?: Record<string, string>;

  @IsOptional()
  @IsString()
  sortBy: string = 'id';

  @IsOptional()
  @IsString()
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}
