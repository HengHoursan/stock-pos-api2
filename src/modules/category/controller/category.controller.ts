import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { CategoryService } from '@/category/service/category.service';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateCategoryStatusRequest,
  CategoryResponse,
} from '@/category/dto';
import {
  PaginationRequest,
  ApiResponse,
  PaginationResponse,
  IdRequest,
  BulkActionRequest,
  BulkStatusUpdateRequest,
} from '@/common/dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @Permissions('category:create')
  async create(
    @Body() dto: CreateCategoryRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.categoryService.create(dto, userId);
    return ApiResponse.success(null, 'Category created successfully');
  }

  @Post('all')
  @Permissions('category:all')
  async all() {
    const categories = await this.categoryService.findAll();
    return ApiResponse.success(
      plainToInstance(CategoryResponse, categories),
      'Category list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('category:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.categoryService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(CategoryResponse, data), meta),
      'Category list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('category:view')
  async detail(@Body() dto: IdRequest) {
    const category = await this.categoryService.findOne(dto.id);
    return ApiResponse.success(
      plainToInstance(CategoryResponse, category),
      'Category detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('category:update')
  async update(
    @Body() dto: UpdateCategoryRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.categoryService.update(dto, userId);
    return ApiResponse.success(null, 'Category updated successfully');
  }

  @Post('status-update')
  @Permissions('category:update')
  async updateStatus(
    @Body() dto: UpdateCategoryStatusRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.categoryService.updateStatus(dto, userId);
    return ApiResponse.success(null, 'Category status updated successfully');
  }

  @Post('soft-delete')
  @Permissions('category:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.categoryService.softDelete(dto.id, userId);
    return ApiResponse.success(null, 'Category deleted successfully');
  }

  @Post('force-delete')
  @Permissions('category:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.categoryService.forceDelete(dto.id);
    return ApiResponse.success(null, 'Category deleted successfully');
  }

  @Post('bulk-soft-delete')
  @Permissions('category:delete')
  async bulkSoftDelete(
    @Body() dto: BulkActionRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.categoryService.bulkSoftDelete(dto.ids, userId);
    return ApiResponse.success(null, 'Categories deleted successfully');
  }

  @Post('bulk-status-update')
  @Permissions('category:update')
  async bulkUpdateStatus(
    @Body() dto: BulkStatusUpdateRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.categoryService.bulkUpdateStatus(dto.ids, dto.status, userId);
    return ApiResponse.success(null, 'Category statuses updated successfully');
  }
}
