import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { SaleInvoiceService } from '../service/sale_invoice.service';
import {
  CreateSaleInvoiceRequest,
  UpdateSaleInvoiceRequest,
  UpdateSaleInvoiceStatusRequest,
  SaleInvoiceResponse,
} from '../dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
} from '@/common/dto';

@Controller('sale-invoices')
export class SaleInvoiceController {
  constructor(private readonly saleInvoiceService: SaleInvoiceService) {}

  @Post('create')
  @Permissions('sale_invoice:create')
  async create(
    @Body() dto: CreateSaleInvoiceRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.saleInvoiceService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleInvoiceResponse, result),
      'Sale Invoice created successfully',
    );
  }

  @Post('all')
  @Permissions('sale_invoice:all')
  async all() {
    const data = await this.saleInvoiceService.findAll();
    return ApiResponse.success(
      plainToInstance(SaleInvoiceResponse, data),
      'Sale Invoice list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('sale_invoice:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.saleInvoiceService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(SaleInvoiceResponse, data), meta),
      'Sale Invoice list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('sale_invoice:view')
  async detail(@Body('id') id: number) {
    const result = await this.saleInvoiceService.findOne(id);
    return ApiResponse.success(
      plainToInstance(SaleInvoiceResponse, result),
      'Sale Invoice detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('sale_invoice:update')
  async update(
    @Body() dto: UpdateSaleInvoiceRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.saleInvoiceService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleInvoiceResponse, result),
      'Sale Invoice updated successfully',
    );
  }

  @Post('status-update')
  @Permissions('sale_invoice:update')
  async updateStatus(
    @Body() dto: UpdateSaleInvoiceStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.saleInvoiceService.updateStatus(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleInvoiceResponse, result),
      'Sale Invoice status updated successfully',
    );
  }

  @Post('cancel')
  @Permissions('sale_invoice:update')
  async cancel(@Body('id') id: number, @CurrentUser('id') userId: number) {
    const result = await this.saleInvoiceService.cancel(id, userId);
    return ApiResponse.success(
      plainToInstance(SaleInvoiceResponse, result),
      'Sale Invoice cancelled successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('sale_invoice:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.saleInvoiceService.softDelete(id, userId);
    return ApiResponse.success(null, 'Sale Invoice soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('sale_invoice:delete')
  async forceDelete(@Body('id') id: number) {
    await this.saleInvoiceService.forceDelete(id);
    return ApiResponse.success(null, 'Sale Invoice permanently deleted');
  }
}
