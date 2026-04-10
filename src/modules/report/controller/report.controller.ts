import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ReportService } from '@/report/service/report.service';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { ApiResponse, PaginationRequest } from '@/common/dto';
import {
  DashboardMetricsResponse,
  SalesReportResponse,
  PurchasesReportResponse,
  ProfitAndLossReportResponse,
  InventoryReportResponse,
  TopPerformersReportResponse,
} from '@/report/dto';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('dashboard')
  @Permissions('report:view_dashboard')
  async getDashboard() {
    const data = await this.reportService.getDashboardMetrics();
    return ApiResponse.success(
      plainToInstance(DashboardMetricsResponse, data),
      'Dashboard metrics fetched successfully',
    );
  }

  @Post('sales')
  @Permissions('report:view_sales')
  async getSalesReport(@Body() pagination: PaginationRequest) {
    const data = await this.reportService.getSalesReport(pagination);
    return ApiResponse.success(
      plainToInstance(SalesReportResponse, data),
      'Sales report fetched successfully',
    );
  }

  @Post('purchases')
  @Permissions('report:view_purchases')
  async getPurchasesReport(@Body() pagination: PaginationRequest) {
    const data = await this.reportService.getPurchasesReport(pagination);
    return ApiResponse.success(
      plainToInstance(PurchasesReportResponse, data),
      'Purchases report fetched successfully',
    );
  }

  @Post('profit-and-loss')
  @Permissions('report:view_profit_loss')
  async getProfitAndLossReport(@Body() pagination: PaginationRequest) {
    const data = await this.reportService.getProfitAndLossReport(pagination);
    return ApiResponse.success(
      plainToInstance(ProfitAndLossReportResponse, data),
      'P&L report fetched successfully',
    );
  }

  @Post('inventory')
  @Permissions('report:view_inventory')
  async getInventoryReport(@Body() pagination: PaginationRequest) {
    const data = await this.reportService.getInventoryReport(pagination);
    return ApiResponse.success(
      plainToInstance(InventoryReportResponse, data),
      'Inventory report fetched successfully',
    );
  }

  @Post('top-performers')
  @Permissions('report:view_top_performers')
  async getTopPerformersReport(@Body() pagination: PaginationRequest) {
    const data = await this.reportService.getTopPerformersReport(pagination);
    return ApiResponse.success(
      plainToInstance(TopPerformersReportResponse, data),
      'Top performers report fetched successfully',
    );
  }
}
