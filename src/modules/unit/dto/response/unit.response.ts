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

  @Expose({ name: 'conversion_factor' })
  conversionFactor: number;

  @Expose({ name: 'default_price' })
  defaultPrice: number;

  @Expose({ name: 'is_calculate_detail' })
  isCalculateDetail: boolean;

  @Expose()
  status: boolean;
}
