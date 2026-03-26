import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current-user.decorator';
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
  async detail(@Body('id') id: number) {
    const brand = await this.brandService.findOne(id);
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
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.brandService.softDelete(id, userId);
    return ApiResponse.success(null, 'Brand soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('brand:delete')
  async forceDelete(@Body('id') id: number) {
    await this.brandService.forceDelete(id);
    return ApiResponse.success(null, 'Brand permanently deleted');
  }
}
