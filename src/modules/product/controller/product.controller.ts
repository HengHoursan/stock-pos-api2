import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { ProductService } from '@/product/service/product.service';
import {
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusRequest,
  ProductResponse,
} from '@/product/dto';
import {
  PaginationRequest,
  ApiResponse,
  PaginationResponse,
} from '@/common/dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @Permissions('product:create')
  async create(
    @Body() dto: CreateProductRequest,
    @CurrentUser('id') userId: number,
  ) {
    const product = await this.productService.create(dto, userId);
    return ApiResponse.success(
        plainToInstance(ProductResponse, product), 
        'Product created successfully'
    );
  }

  @Post('all')
  @Permissions('product:all')
  async all() {
    const products = await this.productService.findAll();
    return ApiResponse.success(
      plainToInstance(ProductResponse, products),
      'Product list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('product:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.productService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(ProductResponse, data), meta),
      'Product list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('product:view')
  async detail(@Body('id') id: number) {
    const product = await this.productService.findOne(id);
    return ApiResponse.success(
      plainToInstance(ProductResponse, product),
      'Product detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('product:update')
  async update(
    @Body() dto: UpdateProductRequest,
    @CurrentUser('id') userId: number,
  ) {
    const product = await this.productService.update(dto, userId);
    return ApiResponse.success(
        plainToInstance(ProductResponse, product), 
        'Product updated successfully'
    );
  }

  @Post('status-update')
  @Permissions('product:update')
  async updateStatus(
    @Body() dto: UpdateProductStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.productService.updateStatus(dto, userId);
    return ApiResponse.success(null, 'Product status updated successfully');
  }

  @Post('soft-delete')
  @Permissions('product:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.productService.softDelete(id, userId);
    return ApiResponse.success(null, 'Product deleted successfully');
  }

  @Post('force-delete')
  @Permissions('product:delete')
  async forceDelete(@Body('id') id: number) {
    await this.productService.forceDelete(id);
    return ApiResponse.success(null, 'Product deleted successfully');
  }
}
