import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { PurchaseQuotationService } from '@/purchase_quotation/service/purchase_quotation.service';
import {
  CreatePurchaseQuotationRequest,
  UpdatePurchaseQuotationRequest,
  PurchaseQuotationResponse,
} from '@/purchase_quotation/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
  BulkActionRequest,
} from '@/common/dto';

@Controller('purchase-quotations')
export class PurchaseQuotationController {
  constructor(
    private readonly purchaseQuotationService: PurchaseQuotationService,
  ) {}

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
      new PaginationResponse(
        plainToInstance(PurchaseQuotationResponse, data),
        meta,
      ),
      'Purchase Quotation list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('purchase_quotation:view')
  async detail(@Body() dto: IdRequest) {
    const result = await this.purchaseQuotationService.findOne(dto.id);
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
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.purchaseQuotationService.softDelete(dto.id, userId);
    return ApiResponse.success(
      null,
      'Purchase Quotation soft deleted successfully',
    );
  }

  @Post('force-delete')
  @Permissions('purchase_quotation:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.purchaseQuotationService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Purchase Quotation deleted successfully');
  }

  @Post('duplicate')
  @Permissions('purchase_quotation:create')
  async duplicate(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const quotation = await this.purchaseQuotationService.duplicate(
      dto.id,
      userId,
    );
    return ApiResponse.success(
      plainToInstance(PurchaseQuotationResponse, quotation),
      'Purchase Quotation duplicated successfully',
    );
  }

  @Post('bulk-soft-delete')
  @Permissions('purchase_quotation:delete')
  async bulkSoftDelete(
    @Body() dto: BulkActionRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.purchaseQuotationService.bulkSoftDelete(dto.ids, userId);
    return ApiResponse.success(
      null,
      'Purchase Quotations deleted successfully',
    );
  }
}
