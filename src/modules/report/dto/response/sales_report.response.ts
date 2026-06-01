import { Expose, Type } from 'class-transformer';
import { PaginationResponse } from '@/common/dto';

class SalesByPaymentMethodResponse {
  @Expose()
  paymentMethod: string;

  @Expose()
  total: number;
}

class SalesByCustomerDataResponse {
  @Expose()
  customerName: string;

  @Expose()
  customerPhone: string;

  @Expose()
  totalSpent: number;

  @Expose()
  totalInvoices: number;
}

class SalesByCashierDataResponse {
  @Expose()
  cashierName: string;

  @Expose()
  totalRevenue: number;

  @Expose()
  totalInvoices: number;
}

export class SalesReportResponse {
  @Expose()
  totalRevenue: number;

  @Expose()
  totalReturns: number;

  @Expose()
  netSales: number;

  @Expose()
  @Type(() => SalesByPaymentMethodResponse)
  salesByPaymentMethod: SalesByPaymentMethodResponse[];

  @Expose()
  @Type(() => PaginationResponse)
  salesByCustomer: PaginationResponse<SalesByCustomerDataResponse>;

  @Expose()
  @Type(() => SalesByCashierDataResponse)
  salesByCashier: SalesByCashierDataResponse[];
}
