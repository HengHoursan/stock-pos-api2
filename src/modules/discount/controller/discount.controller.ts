import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { DiscountService } from '@/discount/service/discount.service';
import {
  CreateDiscountRequest,
  UpdateDiscountRequest,
  DiscountResponse,
} from '@/discount/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
  IdRequest,
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
    const discount = await this.discountService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(DiscountResponse, discount),
      'Discount created successfully',
    );
  }

  @Post('all')
  @Permissions('discount:view')
  async all() {
    const discounts = await this.discountService.findAll();
    return ApiResponse.success(
      plainToInstance(DiscountResponse, discounts),
      'Discount list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('discount:view')
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
  async detail(@Body() dto: IdRequest) {
    const discount = await this.discountService.findOne(dto.id);
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
    const discount = await this.discountService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(DiscountResponse, discount),
      'Discount updated successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('discount:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.discountService.softDelete(dto.id, userId);
    return ApiResponse.success(null, 'Discount soft deleted successfully');
  }
}
