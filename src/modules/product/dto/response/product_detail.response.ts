import { Expose } from 'class-transformer';

export class ProductDetailResponse {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  currentStock: number;

  @Expose()
  stockNumber: string;

  @Expose()
  purchasePrice: number;

  @Expose()
  salePrice: number;

  @Expose()
  expiryDate: Date;

  @Expose()
  expiryType: string;
}
