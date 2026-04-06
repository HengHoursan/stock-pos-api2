import { Expose } from 'class-transformer';

export class UnitResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  parentId: number;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  symbol: string;

  @Expose()
  conversionFactor: number;

  @Expose()
  defaultPrice: number;

  @Expose()
  isCalculateDetail: boolean;

  @Expose()
  status: boolean;
}
