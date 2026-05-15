import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { SalePaymentService } from '@/sale_payment/service/sale_payment.service';
import {
  CreateSalePaymentRequest,
  UpdateSalePaymentRequest,
  SalePaymentResponse,
} from '@/sale_payment/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
} from '@/common/dto';

@Controller('sale-payments')
export class SalePaymentController {
  constructor(private readonly salePaymentService: SalePaymentService) {}

  @Post('create')
  @Permissions('sale_payment:create')
  async create(
    @Body() dto: CreateSalePaymentRequest,
    @CurrentUser('id') userId: number,
  ) {
    const payment = await this.salePaymentService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(SalePaymentResponse, payment),
      'Sale Payment created successfully',
    );
  }

  @Post('all')
  @Permissions('sale_payment:all')
  async all() {
    const payments = await this.salePaymentService.findAll();
    return ApiResponse.success(
      plainToInstance(SalePaymentResponse, payments),
      'Sale Payment list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('sale_payment:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.salePaymentService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(SalePaymentResponse, data), meta),
      'Sale Payment list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('sale_payment:view')
  async detail(@Body() dto: IdRequest) {
    const payment = await this.salePaymentService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(SalePaymentResponse, payment),
      'Sale Payment detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('sale_payment:update')
  async update(
    @Body() dto: UpdateSalePaymentRequest,
    @CurrentUser('id') userId: number,
  ) {
    const payment = await this.salePaymentService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(SalePaymentResponse, payment),
      'Sale Payment updated successfully',
    );
  }

  @Post('cancel')
  @Permissions('sale_payment:update')
  async cancel(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const result = await this.salePaymentService.cancel(dto.id, userId);
    return ApiResponse.success(
      plainToInstance(SalePaymentResponse, result),
      'Sale Payment cancelled successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('sale_payment:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.salePaymentService.softDelete(dto.id, userId);
    return ApiResponse.success(null, 'Sale Payment soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('sale_payment:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.salePaymentService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Sale Payment permanently deleted');
  }
}
