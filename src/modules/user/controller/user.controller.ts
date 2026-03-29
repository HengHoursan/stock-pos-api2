import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { UserService } from '@/user/service/user.service';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '@/user/dto';
import {
  PaginationRequest,
  ApiResponse,
  PaginationResponse,
} from '@/common/dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
 
  @Post('me')
  async me(@CurrentUser('id') userId: number) {
    const user = await this.userService.getProfile(userId);
    return ApiResponse.success(
      plainToInstance(UserResponse, user),
      'User profile retrieved successfully',
    );
  }

  @Post('create')
  @Permissions('user:create')
  async create(
    @Body() dto: CreateUserRequest,
    @CurrentUser('id') userId: number,
  ) {
    const user = await this.userService.create(dto, userId);
    return ApiResponse.success(
      plainToInstance(UserResponse, user),
      'User created successfully',
    );
  }

  @Post('all')
  @Permissions('user:view')
  async all() {
    const users = await this.userService.findAll();
    return ApiResponse.success(
      plainToInstance(UserResponse, users),
      'User list retrieved successfully',
    );
  }

  @Post('list')
  @Permissions('user:view')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.userService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(UserResponse, data), meta),
      'User list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('user:view')
  async detail(@Body('id') id: number) {
    const user = await this.userService.findOne(id);
    return ApiResponse.success(
      plainToInstance(UserResponse, user),
      'User detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('user:update')
  async update(
    @Body() dto: UpdateUserRequest,
    @CurrentUser('id') userId: number,
  ) {
    const user = await this.userService.update(dto, userId);
    return ApiResponse.success(
      plainToInstance(UserResponse, user),
      'User updated successfully',
    );
  }

  @Post('soft-delete')
  @Permissions('user:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.userService.softDelete(id, userId);
    return ApiResponse.success(null, 'User soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('user:delete')
  async forceDelete(@Body('id') id: number) {
    await this.userService.forceDelete(id);
    return ApiResponse.success(null, 'User permanently deleted');
  }
}
