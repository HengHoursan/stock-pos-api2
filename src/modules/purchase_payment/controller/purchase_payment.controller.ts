import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { PurchasePaymentService } from '@/purchase_payment/service/purchase_payment.service';
import {
  CreatePurchasePaymentRequest,
  UpdatePurchasePaymentRequest,
  PurchasePaymentResponse,
} from '@/purchase_payment/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
} from '@/common/dto';

@Controller('purchase-payments')
export class PurchasePaymentController {
  constructor(
    private readonly purchasePaymentService: PurchasePaymentService,
  ) {}

  @Post('create')
  @Permissions('purchase_payment:create')
  async create(
    @Body() dto: CreatePurchasePaymentRequest,
    @CurrentUser('id') userId: number,
  ) {
    const payment = await this.purchasePaymentService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchasePaymentResponse, payment),
      'Purchase Payment created successfully',
    );
  }

  @Post('all')
  @Permissions('purchase_payment:all')
  async all() {
    const payments = await this.purchasePaymentService.findAll();
    return ApiResponse.success(
      plainToInstance(PurchasePaymentResponse, payments),
      'Purchase Payment list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('purchase_payment:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.purchasePaymentService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(
        plainToInstance(PurchasePaymentResponse, data),
        meta,
      ),
      'Purchase Payment list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('purchase_payment:view')
  async detail(@Body() dto: IdRequest) {
    const payment = await this.purchasePaymentService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(PurchasePaymentResponse, payment),
      'Purchase Payment detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('purchase_payment:update')
  async update(
    @Body() dto: UpdatePurchasePaymentRequest,
    @CurrentUser('id') userId: number,
  ) {
    const payment = await this.purchasePaymentService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchasePaymentResponse, payment),
      'Purchase Payment updated successfully',
    );
  }

  @Post('cancel')
  @Permissions('purchase_payment:update')
  async cancel(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const result = await this.purchasePaymentService.cancel(dto.id, userId);
    return ApiResponse.success(
      plainToInstance(PurchasePaymentResponse, result),
      'Purchase Payment cancelled successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('purchase_payment:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.purchasePaymentService.softDelete(dto.id, userId);
    return ApiResponse.success(
      null,
      'Purchase Payment soft deleted successfully',
    );
  }

  @Post('force-delete')
  @Permissions('purchase_payment:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.purchasePaymentService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Purchase Payment permanently deleted');
  }
}
