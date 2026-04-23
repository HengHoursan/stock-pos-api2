import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { PurchaseReturnService } from '@/purchase_return/service/purchase_return.service';
import {
  CreatePurchaseReturnRequest,
  UpdatePurchaseReturnRequest,
  UpdatePurchaseReturnStatusRequest,
  PurchaseReturnResponse,
} from '@/purchase_return/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
} from '@/common/dto';

@Controller('purchase-returns')
export class PurchaseReturnController {
  constructor(private readonly purchaseReturnService: PurchaseReturnService) {}

  @Post('create')
  @Permissions('purchase_return:create')
  async create(
    @Body() dto: CreatePurchaseReturnRequest,
    @CurrentUser('id') userId: number,
  ) {
    const purchaseReturn = await this.purchaseReturnService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseReturnResponse, purchaseReturn),
      'Purchase Return created successfully',
    );
  }

  @Post('all')
  @Permissions('purchase_return:all')
  async all() {
    const purchaseReturns = await this.purchaseReturnService.findAll();
    return ApiResponse.success(
      plainToInstance(PurchaseReturnResponse, purchaseReturns),
      'Purchase Return list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('purchase_return:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.purchaseReturnService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(PurchaseReturnResponse, data), meta),
      'Purchase Return list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('purchase_return:view')
  async detail(@Body() dto: IdRequest) {
    const purchaseReturn = await this.purchaseReturnService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(PurchaseReturnResponse, purchaseReturn),
      'Purchase Return detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('purchase_return:update')
  async update(
    @Body() dto: UpdatePurchaseReturnRequest,
    @CurrentUser('id') userId: number,
  ) {
    const purchaseReturn = await this.purchaseReturnService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseReturnResponse, purchaseReturn),
      'Purchase Return updated successfully',
    );
  }

  @Post('status-update')
  @Permissions('purchase_return:update')
  async updateStatus(
    @Body() dto: UpdatePurchaseReturnStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    const purchaseReturn = await this.purchaseReturnService.updateStatus(dto, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseReturnResponse, purchaseReturn),
      'Purchase Return status updated successfully',
    );
  }

  @Post('cancel')
  @Permissions('purchase_return:update')
  async cancel(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const result = await this.purchaseReturnService.cancel(dto.id, userId);
    return ApiResponse.success(
      plainToInstance(PurchaseReturnResponse, result),
      'Purchase Return cancelled successfully',
    );
  }

  @Post('force-delete')
  @Permissions('purchase_return:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.purchaseReturnService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Purchase Return permanently deleted');
  }
}
