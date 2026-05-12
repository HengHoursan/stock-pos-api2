import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { BrandService } from '@/brand/service/brand.service';
import {
  CreateBrandRequest,
  UpdateBrandRequest,
  UpdateBrandStatusRequest,
  BrandResponse,
} from '@/brand/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
  BulkActionRequest,
  BulkStatusUpdateRequest,
} from '@/common/dto';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post('create')
  @Permissions('brand:create')
  async create(
    @Body() dto: CreateBrandRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.brandService.create(dto, userId);
    return ApiResponse.success(null, 'Brand created successfully');
  }

  @Post('all')
  @Permissions('brand:all')
  async all() {
    const brands = await this.brandService.findAll();
    return ApiResponse.success(
      plainToInstance(BrandResponse, brands),
      'Brand list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('brand:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.brandService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(BrandResponse, data), meta),
      'Brand list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('brand:view')
  async detail(@Body() dto: IdRequest) {
    const brand = await this.brandService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(BrandResponse, brand),
      'Brand detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('brand:update')
  async update(
    @Body() dto: UpdateBrandRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.brandService.update(dto, userId);
    return ApiResponse.success(null, 'Brand updated successfully');
  }

  @Post('status-update')
  @Permissions('brand:update')
  async updateStatus(
    @Body() dto: UpdateBrandStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.brandService.updateStatus(dto, userId);
    return ApiResponse.success(null, 'Brand status updated successfully');
  }

  @Post('soft-delete')
  @Permissions('brand:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.brandService.softDelete(dto.id, userId);
    return ApiResponse.success(null, 'Brand soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('brand:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.brandService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Brand deleted successfully');
  }

  @Post('bulk-soft-delete')
  @Permissions('brand:delete')
  async bulkSoftDelete(
    @Body() dto: BulkActionRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.brandService.bulkSoftDelete(dto.ids, userId);
    return ApiResponse.success(null, 'Brands deleted successfully');
  }

  @Post('bulk-status-update')
  @Permissions('brand:update')
  async bulkUpdateStatus(
    @Body() dto: BulkStatusUpdateRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.brandService.bulkUpdateStatus(dto.ids, dto.status, userId);
    return ApiResponse.success(null, 'Brand statuses updated successfully');
  }
}
