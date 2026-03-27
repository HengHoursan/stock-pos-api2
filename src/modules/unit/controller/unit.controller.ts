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
  async detail(@Body('id') id: number) {
    const unit = await this.unitService.findOne(id);
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
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.unitService.softDelete(id, userId);
    return ApiResponse.success(null, 'Unit soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('unit:delete')
  async forceDelete(@Body('id') id: number) {
    await this.unitService.forceDelete(id);
    return ApiResponse.success(null, 'Unit permanently deleted');
  }
}
