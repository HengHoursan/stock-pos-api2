import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { SaleQuotationService } from '@/sale_quotation/service/sale_quotation.service';
import {
  CreateSaleQuotationRequest,
  UpdateSaleQuotationRequest,
  SaleQuotationResponse,
} from '@/sale_quotation/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
  BulkActionRequest,
} from '@/common/dto';

@Controller('sale-quotations')
export class SaleQuotationController {
  constructor(private readonly saleQuotationService: SaleQuotationService) {}

  @Post('create')
  @Permissions('sale_quotation:create')
  async create(
    @Body() dto: CreateSaleQuotationRequest,
    @CurrentUser('id') userId: number,
  ) {
    const quotation = await this.saleQuotationService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleQuotationResponse, quotation),
      'Sale Quotation created successfully',
    );
  }

  @Post('all')
  @Permissions('sale_quotation:all')
  async all() {
    const quotations = await this.saleQuotationService.findAll();
    return ApiResponse.success(
      plainToInstance(SaleQuotationResponse, quotations),
      'Sale Quotation list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('sale_quotation:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.saleQuotationService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(SaleQuotationResponse, data), meta),
      'Sale Quotation list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('sale_quotation:view')
  async detail(@Body() dto: IdRequest) {
    const quotation = await this.saleQuotationService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(SaleQuotationResponse, quotation),
      'Sale Quotation detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('sale_quotation:update')
  async update(
    @Body() dto: UpdateSaleQuotationRequest,
    @CurrentUser('id') userId: number,
  ) {
    const quotation = await this.saleQuotationService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleQuotationResponse, quotation),
      'Sale Quotation updated successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('sale_quotation:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.saleQuotationService.softDelete(dto.id, userId);
    return ApiResponse.success(null, 'Sale Quotation soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('sale_quotation:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.saleQuotationService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Sale Quotation deleted successfully');
  }

  @Post('duplicate')
  @Permissions('sale_quotation:create')
  async duplicate(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const quotation = await this.saleQuotationService.duplicate(dto.id, userId);
    return ApiResponse.success(
      plainToInstance(SaleQuotationResponse, quotation),
      'Sale Quotation duplicated successfully',
    );
  }

  @Post('bulk-soft-delete')
  @Permissions('sale_quotation:delete')
  async bulkSoftDelete(
    @Body() dto: BulkActionRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.saleQuotationService.bulkSoftDelete(dto.ids, userId);
    return ApiResponse.success(null, 'Sale Quotations deleted successfully');
  }
}
