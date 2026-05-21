import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { SaleOrderService } from '@/sale_order/service/sale_order.service';
import {
  CreateSaleOrderRequest,
  UpdateSaleOrderRequest,
  UpdateSaleOrderStatusRequest,
  SaleOrderResponse,
} from '@/sale_order/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
  BulkActionRequest,
  BulkEnumStatusUpdateRequest,
} from '@/common/dto';

@Controller('sale-orders')
export class SaleOrderController {
  constructor(private readonly saleOrderService: SaleOrderService) {}

  @Post('create')
  @Permissions('sale_order:create')
  async create(
    @Body() dto: CreateSaleOrderRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.saleOrderService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleOrderResponse, result),
      'Sale Order created successfully',
    );
  }

  @Post('all')
  @Permissions('sale_order:all')
  async all() {
    const data = await this.saleOrderService.findAll();
    return ApiResponse.success(
      plainToInstance(SaleOrderResponse, data),
      'Sale Order list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('sale_order:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.saleOrderService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(SaleOrderResponse, data), meta),
      'Sale Order list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('sale_order:view')
  async detail(@Body() dto: IdRequest) {
    const result = await this.saleOrderService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(SaleOrderResponse, result),
      'Sale Order detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('sale_order:update')
  async update(
    @Body() dto: UpdateSaleOrderRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.saleOrderService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleOrderResponse, result),
      'Sale Order updated successfully',
    );
  }

  @Post('status-update')
  @Permissions('sale_order:update')
  async updateStatus(
    @Body() dto: UpdateSaleOrderStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    const result = await this.saleOrderService.updateStatus(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleOrderResponse, result),
      'Sale Order status updated successfully',
    );
  }

  @Post('cancel')
  @Permissions('sale_order:update')
  async cancel(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const result = await this.saleOrderService.cancel(dto.id, userId);
    return ApiResponse.success(
      plainToInstance(SaleOrderResponse, result),
      'Sale Order cancelled successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('sale_order:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.saleOrderService.softDelete(dto.id, userId);
    return ApiResponse.success(null, 'Sale Order soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('sale_order:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.saleOrderService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Sale Order deleted successfully');
  }

  @Post('duplicate')
  @Permissions('sale_order:create')
  async duplicate(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const result = await this.saleOrderService.duplicate(dto.id, userId);
    return ApiResponse.success(
      plainToInstance(SaleOrderResponse, result),
      'Sale Order duplicated successfully',
    );
  }

  @Post('bulk-soft-delete')
  @Permissions('sale_order:delete')
  async bulkSoftDelete(
    @Body() dto: BulkActionRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.saleOrderService.bulkSoftDelete(dto.ids, userId);
    return ApiResponse.success(null, 'Sale Orders deleted successfully');
  }

  @Post('bulk-status-update')
  @Permissions('sale_order:update')
  async bulkUpdateStatus(
    @Body() dto: BulkEnumStatusUpdateRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.saleOrderService.bulkUpdateStatus(
      dto.ids,
      dto.status as any,
      userId,
    );
    return ApiResponse.success(
      null,
      'Sale Order statuses updated successfully',
    );
  }
}
