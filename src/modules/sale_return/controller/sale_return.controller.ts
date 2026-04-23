import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { SaleReturnService } from '@/sale_return/service/sale_return.service';
import {
  CreateSaleReturnRequest,
  UpdateSaleReturnRequest,
  UpdateSaleReturnStatusRequest,
  SaleReturnResponse,
} from '@/sale_return/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
} from '@/common/dto';

@Controller('sale-returns')
export class SaleReturnController {
  constructor(private readonly saleReturnService: SaleReturnService) {}

  @Post('create')
  @Permissions('sale_return:create')
  async create(
    @Body() dto: CreateSaleReturnRequest,
    @CurrentUser('id') userId: number,
  ) {
    const saleReturn = await this.saleReturnService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleReturnResponse, saleReturn),
      'Sale Return created successfully',
    );
  }

  @Post('all')
  @Permissions('sale_return:all')
  async all() {
    const saleReturns = await this.saleReturnService.findAll();
    return ApiResponse.success(
      plainToInstance(SaleReturnResponse, saleReturns),
      'Sale Return list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('sale_return:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.saleReturnService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(SaleReturnResponse, data), meta),
      'Sale Return list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('sale_return:view')
  async detail(@Body() dto: IdRequest) {
    const saleReturn = await this.saleReturnService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(SaleReturnResponse, saleReturn),
      'Sale Return detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('sale_return:update')
  async update(
    @Body() dto: UpdateSaleReturnRequest,
    @CurrentUser('id') userId: number,
  ) {
    const saleReturn = await this.saleReturnService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleReturnResponse, saleReturn),
      'Sale Return updated successfully',
    );
  }

  @Post('status-update')
  @Permissions('sale_return:update')
  async updateStatus(
    @Body() dto: UpdateSaleReturnStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    const saleReturn = await this.saleReturnService.updateStatus(dto, userId);
    return ApiResponse.success(
      plainToInstance(SaleReturnResponse, saleReturn),
      'Sale Return status updated successfully',
    );
  }

  @Post('cancel')
  @Permissions('sale_return:update')
  async cancel(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    const result = await this.saleReturnService.cancel(dto.id, userId);
    return ApiResponse.success(
      plainToInstance(SaleReturnResponse, result),
      'Sale Return cancelled successfully',
    );
  }

  @Post('force-delete')
  @Permissions('sale_return:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.saleReturnService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Sale Return permanently deleted');
  }
}
