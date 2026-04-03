import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { CustomerService } from '../service/customer.service';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  UpdateCustomerStatusRequest,
  CustomerResponse,
} from '../dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
} from '@/common/dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('create')
  @Permissions('customer:create')
  async create(
    @Body() dto: CreateCustomerRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.customerService.create(dto, userId);
    return ApiResponse.success(null, 'Customer created successfully');
  }

  @Post('all')
  @Permissions('customer:all')
  async all() {
    const customers = await this.customerService.findAll();
    return ApiResponse.success(
      plainToInstance(CustomerResponse, customers),
      'Customer list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('customer:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.customerService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(CustomerResponse, data), meta),
      'Customer list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('customer:view')
  async detail(@Body('id') id: number) {
    const customer = await this.customerService.findOne(id);
    return ApiResponse.success(
      plainToInstance(CustomerResponse, customer),
      'Customer detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('customer:update')
  async update(
    @Body() dto: UpdateCustomerRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.customerService.update(dto, userId);
    return ApiResponse.success(null, 'Customer updated successfully');
  }

  @Post('status-update')
  @Permissions('customer:update')
  async updateStatus(
    @Body() dto: UpdateCustomerStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.customerService.updateStatus(dto, userId);
    return ApiResponse.success(null, 'Customer status updated successfully');
  }

  @Post('soft-delete')
  @Permissions('customer:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.customerService.softDelete(id, userId);
    return ApiResponse.success(null, 'Customer soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('customer:delete')
  async forceDelete(@Body('id') id: number) {
    await this.customerService.forceDelete(id);
    return ApiResponse.success(null, 'Customer permanently deleted');
  }
}
