import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { PurchaseOrderService } from '@/purchase_order/service/purchase_order.service';
import {
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  UpdatePurchaseOrderStatusRequest,
  PurchaseOrderResponse,
} from '@/purchase_order/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
  BulkActionRequest,
  BulkEnumStatusUpdateRequest,
} from '@/common/dto';

@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post('create')
  @Permissions('purchase_order:create')
  async create(
    @Body() dto: CreatePurchaseOrderRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.purchaseOrderService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseOrderResponse, result),
      'Purchase Order created successfully',
    );
  }

  @Post('all')
  @Permissions('purchase_order:all')
  async all() {
    const data = await this.purchaseOrderService.findAll();
    return ApiResponse.success(
      plainToInstance(PurchaseOrderResponse, data),
      'Purchase Order list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('purchase_order:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.purchaseOrderService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(
        plainToInstance(PurchaseOrderResponse, data),
        meta,
      ),
      'Purchase Order list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('purchase_order:view')
  async detail(@Body() dto: IdRequest) {
    const result = await this.purchaseOrderService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(PurchaseOrderResponse, result),
      'Purchase Order detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('purchase_order:update')
  async update(
    @Body() dto: UpdatePurchaseOrderRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.purchaseOrderService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseOrderResponse, result),
      'Purchase Order updated successfully',
    );
  }

  @Post('status-update')
  @Permissions('purchase_order:update')
  async updateStatus(
    @Body() dto: UpdatePurchaseOrderStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.purchaseOrderService.updateStatus(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseOrderResponse, result),
      'Purchase Order status updated successfully',
    );
  }

  @Post('cancel')
  @Permissions('purchase_order:update')
  async cancel(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const result = await this.purchaseOrderService.cancel(dto.id, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseOrderResponse, result),
      'Purchase Order cancelled successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('purchase_order:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.purchaseOrderService.softDelete(dto.id, userId);
    return ApiResponse.success(
      null,
      'Purchase Order soft deleted successfully',
    );
  }

  @Post('force-delete')
  @Permissions('purchase_order:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.purchaseOrderService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Purchase Order deleted successfully');
  }

  @Post('duplicate')
  @Permissions('purchase_order:create')
  async duplicate(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const result = await this.purchaseOrderService.duplicate(dto.id, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseOrderResponse, result),
      'Purchase Order duplicated successfully',
    );
  }

  @Post('bulk-soft-delete')
  @Permissions('purchase_order:delete')
  async bulkSoftDelete(
    @Body() dto: BulkActionRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.purchaseOrderService.bulkSoftDelete(dto.ids, userId);
    return ApiResponse.success(null, 'Purchase Orders deleted successfully');
  }

  @Post('bulk-status-update')
  @Permissions('purchase_order:update')
  async bulkUpdateStatus(
    @Body() dto: BulkEnumStatusUpdateRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.purchaseOrderService.bulkUpdateStatus(
      dto.ids,
      dto.status as any,
      userId,
    );
    return ApiResponse.success(
      null,
      'Purchase Order statuses updated successfully',
    );
  }
}
