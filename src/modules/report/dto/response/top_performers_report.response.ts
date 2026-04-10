import { Expose, Type } from 'class-transformer';
import { PaginationResponse } from '@/common/dto';

class BestSellingProductDataResponse {
  @Expose()
  productName: string;

  @Expose()
  productCode: string;

  @Expose()
  totalSold: number;

  @Expose()
  revenueGenerated: number;
}

class TopCustomerDataResponse {
  @Expose()
  customerName: string;

  @Expose()
  customerPhone: string;

  @Expose()
  totalSpent: number;
}

export class TopPerformersReportResponse {
  @Expose()
  @Type(() => PaginationResponse)
  bestSellingProducts: PaginationResponse<BestSellingProductDataResponse>;

  @Expose()
  @Type(() => PaginationResponse)
  topCustomers: PaginationResponse<TopCustomerDataResponse>;
}
