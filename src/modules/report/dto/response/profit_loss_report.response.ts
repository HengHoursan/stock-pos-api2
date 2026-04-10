import { Expose } from 'class-transformer';

export class ProfitAndLossReportResponse {
  @Expose()
  netSales: number;

  @Expose()
  costOfGoodsSold: number;

  @Expose()
  grossProfit: number;

  @Expose()
  expenses: number;

  @Expose()
  netProfit: number;
}
