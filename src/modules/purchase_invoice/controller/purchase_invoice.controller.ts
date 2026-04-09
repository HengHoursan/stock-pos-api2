import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { PurchaseInvoiceService } from '@/purchase_invoice/service/purchase_invoice.service';
import {
  CreatePurchaseInvoiceRequest,
  UpdatePurchaseInvoiceRequest,
  UpdatePurchaseInvoiceStatusRequest,
  PurchaseInvoiceResponse,
} from '@/purchase_invoice/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
} from '@/common/dto';

@Controller('purchase-invoices')
export class PurchaseInvoiceController {
  constructor(private readonly purchaseInvoiceService: PurchaseInvoiceService) {}

  @Post('create')
  @Permissions('purchase_invoice:create')
  async create(
    @Body() dto: CreatePurchaseInvoiceRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.purchaseInvoiceService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseInvoiceResponse, result),
      'Purchase Invoice created successfully',
    );
  }

  @Post('all')
  @Permissions('purchase_invoice:all')
  async all() {
    const data = await this.purchaseInvoiceService.findAll();
    return ApiResponse.success(
      plainToInstance(PurchaseInvoiceResponse, data),
      'Purchase Invoice list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('purchase_invoice:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.purchaseInvoiceService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(PurchaseInvoiceResponse, data), meta),
      'Purchase Invoice list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('purchase_invoice:view')
  async detail(@Body('id') id: number) {
    const result = await this.purchaseInvoiceService.findOne(id);
    return ApiResponse.success(
      plainToInstance(PurchaseInvoiceResponse, result),
      'Purchase Invoice detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('purchase_invoice:update')
  async update(
    @Body() dto: UpdatePurchaseInvoiceRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.purchaseInvoiceService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseInvoiceResponse, result),
      'Purchase Invoice updated successfully',
    );
  }

  @Post('status-update')
  @Permissions('purchase_invoice:update')
  async updateStatus(
    @Body() dto: UpdatePurchaseInvoiceStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.purchaseInvoiceService.updateStatus(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseInvoiceResponse, result),
      'Purchase Invoice status updated successfully',
    );
  }

  @Post('cancel')
  @Permissions('purchase_invoice:update')
  async cancel(@Body('id') id: number, @CurrentUser('id') userId: number) {
    const result = await this.purchaseInvoiceService.cancel(id, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseInvoiceResponse, result),
      'Purchase Invoice cancelled successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('purchase_invoice:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.purchaseInvoiceService.softDelete(id, userId);
    return ApiResponse.success(null, 'Purchase Invoice soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('purchase_invoice:delete')
  async forceDelete(@Body('id') id: number) {
    await this.purchaseInvoiceService.forceDelete(id);
    return ApiResponse.success(null, 'Purchase Invoice permanently deleted');
  }
}
