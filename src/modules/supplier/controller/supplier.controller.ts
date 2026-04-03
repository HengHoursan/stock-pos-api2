import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { SupplierService } from '../service/supplier.service';
import {
  CreateSupplierRequest,
  UpdateSupplierRequest,
  UpdateSupplierStatusRequest,
  SupplierResponse,
} from '../dto';
import {
  ApiResponse,
  PaginationRequest,
  PaginationResponse,
} from '@/common/dto';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post('create')
  @Permissions('supplier:create')
  async create(
    @Body() dto: CreateSupplierRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.supplierService.create(dto, userId);
    return ApiResponse.success(null, 'Supplier created successfully');
  }

  @Post('all')
  @Permissions('supplier:all')
  async all() {
    const suppliers = await this.supplierService.findAll();
    return ApiResponse.success(
      plainToInstance(SupplierResponse, suppliers),
      'Supplier list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('supplier:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.supplierService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(SupplierResponse, data), meta),
      'Supplier list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('supplier:view')
  async detail(@Body('id') id: number) {
    const supplier = await this.supplierService.findOne(id);
    return ApiResponse.success(
      plainToInstance(SupplierResponse, supplier),
      'Supplier detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('supplier:update')
  async update(
    @Body() dto: UpdateSupplierRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.supplierService.update(dto, userId);
    return ApiResponse.success(null, 'Supplier updated successfully');
  }

  @Post('status-update')
  @Permissions('supplier:update')
  async updateStatus(
    @Body() dto: UpdateSupplierStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.supplierService.updateStatus(dto, userId);
    return ApiResponse.success(null, 'Supplier status updated successfully');
  }

  @Post('soft-delete')
  @Permissions('supplier:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.supplierService.softDelete(id, userId);
    return ApiResponse.success(null, 'Supplier soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('supplier:delete')
  async forceDelete(@Body('id') id: number) {
    await this.supplierService.forceDelete(id);
    return ApiResponse.success(null, 'Supplier permanently deleted');
  }
}
