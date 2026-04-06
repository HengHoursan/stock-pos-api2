import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { PurchaseQuotationService } from '../service/purchase_quotation.service';
import {
  CreatePurchaseQuotationRequest,
  UpdatePurchaseQuotationRequest,
  PurchaseQuotationResponse,
} from '../dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
} from '@/common/dto';

@Controller('purchase-quotations')
export class PurchaseQuotationController {
  constructor(private readonly purchaseQuotationService: PurchaseQuotationService) {}

  @Post('create')
  @Permissions('purchase_quotation:create')
  async create(
    @Body() dto: CreatePurchaseQuotationRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.purchaseQuotationService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseQuotationResponse, result),
      'Purchase Quotation created successfully',
    );
  }

  @Post('all')
  @Permissions('purchase_quotation:all')
  async all() {
    const data = await this.purchaseQuotationService.findAll();
    return ApiResponse.success(
      plainToInstance(PurchaseQuotationResponse, data),
      'Purchase Quotation list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('purchase_quotation:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.purchaseQuotationService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(PurchaseQuotationResponse, data), meta),
      'Purchase Quotation list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('purchase_quotation:view')
  async detail(@Body('id') id: number) {
    const result = await this.purchaseQuotationService.findOne(id);
    return ApiResponse.success(
      plainToInstance(PurchaseQuotationResponse, result),
      'Purchase Quotation detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('purchase_quotation:update')
  async update(
    @Body() dto: UpdatePurchaseQuotationRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.purchaseQuotationService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseQuotationResponse, result),
      'Purchase Quotation updated successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('purchase_quotation:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.purchaseQuotationService.softDelete(id, userId);
    return ApiResponse.success(null, 'Purchase Quotation soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('purchase_quotation:delete')
  async forceDelete(@Body('id') id: number) {
    await this.purchaseQuotationService.forceDelete(id);
    return ApiResponse.success(null, 'Purchase Quotation permanently deleted');
  }
}
