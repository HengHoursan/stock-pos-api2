import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { CurrencyService } from '@/currency/service/currency.service';
import {
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
  UpdateCurrencyStatusRequest,
  CurrencyResponse,
} from '@/currency/dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
} from '@/common/dto';

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('create')
  @Permissions('currency:create')
  async create(
    @Body() dto: CreateCurrencyRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.currencyService.create(dto, userId);
    return ApiResponse.success(null, 'Currency created successfully');
  }

  @Post('all')
  @Permissions('currency:all')
  async all() {
    const currencies = await this.currencyService.findAll();
    return ApiResponse.success(
      plainToInstance(CurrencyResponse, currencies),
      'Currency list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('currency:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.currencyService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(CurrencyResponse, data), meta),
      'Currency list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('currency:view')
  async detail(@Body('id') id: number) {
    const currency = await this.currencyService.findOne(id);
    return ApiResponse.success(
      plainToInstance(CurrencyResponse, currency),
      'Currency detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('currency:update')
  async update(
    @Body() dto: UpdateCurrencyRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.currencyService.update(dto, userId);
    return ApiResponse.success(null, 'Currency updated successfully');
  }

  @Post('status-update')
  @Permissions('currency:update')
  async updateStatus(
    @Body() dto: UpdateCurrencyStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.currencyService.updateStatus(dto, userId);
    return ApiResponse.success(null, 'Currency status updated successfully');
  }

  @Post('soft-delete')
  @Permissions('currency:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.currencyService.softDelete(id, userId);
    return ApiResponse.success(null, 'Currency soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('currency:delete')
  async forceDelete(@Body('id') id: number) {
    await this.currencyService.forceDelete(id);
    return ApiResponse.success(null, 'Currency permanently deleted');
  }
}
