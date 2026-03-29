import { Expose } from 'class-transformer';

export class DiscountResponse {
  @Expose()
  id: number;

  @Expose()
  code: string;

  @Expose()
  discountType: string;

  @Expose()
  discountAmount: number;

  @Expose()
  discountStartDate: Date;

  @Expose()
  discountEndDate: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
