import { Injectable } from '@nestjs/common';
import { PaginationRequest } from '@/common/dto';
import { ReportRepository } from '@/report/repository/report.repository';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async getDashboardMetrics() {
    return this.reportRepository.getDashboardMetrics();
  }

  async getSalesReport(query: PaginationRequest) {
    return this.reportRepository.getSalesReport(query);
  }

  async getPurchasesReport(query: PaginationRequest) {
    return this.reportRepository.getPurchasesReport(query);
  }

  async getProfitAndLossReport(query: PaginationRequest) {
    return this.reportRepository.getProfitAndLossReport(query);
  }

  async getInventoryReport(query: PaginationRequest) {
    return this.reportRepository.getInventoryReport(query);
  }

  async getTopPerformersReport(query: PaginationRequest) {
    return this.reportRepository.getTopPerformersReport(query);
  }
}
