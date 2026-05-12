import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { UnitService } from '@/unit/service/unit.service';
import {
  CreateUnitRequest,
  UpdateUnitRequest,
  UpdateUnitStatusRequest,
  UnitResponse,
} from '@/unit/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
  BulkActionRequest,
  BulkStatusUpdateRequest,
} from '@/common/dto';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post('create')
  @Permissions('unit:create')
  async create(
    @Body() dto: CreateUnitRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.unitService.create(dto, userId);
    return ApiResponse.success(null, 'Unit created successfully');
  }

  @Post('all')
  @Permissions('unit:all')
  async all() {
    const units = await this.unitService.findAll();
    return ApiResponse.success(
      plainToInstance(UnitResponse, units),
      'Unit list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('unit:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.unitService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(UnitResponse, data), meta),
      'Unit list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('unit:view')
  async detail(@Body() dto: IdRequest) {
    const unit = await this.unitService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(UnitResponse, unit),
      'Unit detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('unit:update')
  async update(
    @Body() dto: UpdateUnitRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.unitService.update(dto, userId);
    return ApiResponse.success(null, 'Unit updated successfully');
  }

  @Post('status-update')
  @Permissions('unit:update')
  async updateStatus(
    @Body() dto: UpdateUnitStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.unitService.updateStatus(dto, userId);
    return ApiResponse.success(null, 'Unit status updated successfully');
  }

  @Post('soft-delete')
  @Permissions('unit:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.unitService.softDelete(dto.id, userId);
    return ApiResponse.success(null, 'Unit soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('unit:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.unitService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Unit deleted successfully');
  }

  @Post('bulk-soft-delete')
  @Permissions('unit:delete')
  async bulkSoftDelete(
    @Body() dto: BulkActionRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.unitService.bulkSoftDelete(dto.ids, userId);
    return ApiResponse.success(null, 'Units deleted successfully');
  }

  @Post('bulk-status-update')
  @Permissions('unit:update')
  async bulkUpdateStatus(
    @Body() dto: BulkStatusUpdateRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.unitService.bulkUpdateStatus(dto.ids, dto.status, userId);
    return ApiResponse.success(null, 'Unit statuses updated successfully');
  }
}
