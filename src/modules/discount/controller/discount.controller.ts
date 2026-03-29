import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { DiscountService } from '../service/discount.service';
import {
  CreateDiscountRequest,
  UpdateDiscountRequest,
  DiscountResponse,
} from '../dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
} from '@/common/dto';

@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post('create')
  @Permissions('discount:create')
  async create(
    @Body() dto: CreateDiscountRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.discountService.create(dto, userId);
    return ApiResponse.success(null, 'Discount created successfully');
  }

  @Post('all')
  @Permissions('discount:all')
  async all() {
    const discounts = await this.discountService.findAll();
    return ApiResponse.success(
      plainToInstance(DiscountResponse, discounts),
      'Discount list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('discount:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.discountService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(DiscountResponse, data), meta),
      'Discount list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('discount:view')
  async detail(@Body('id') id: number) {
    const discount = await this.discountService.findOne(id);
    return ApiResponse.success(
      plainToInstance(DiscountResponse, discount),
      'Discount detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('discount:update')
  async update(
    @Body() dto: UpdateDiscountRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.discountService.update(dto, userId);
    return ApiResponse.success(null, 'Discount updated successfully');
  }

  @Post('soft-delete')
  @Permissions('discount:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.discountService.softDelete(id, userId);
    return ApiResponse.success(null, 'Discount soft deleted successfully');
  }
}
