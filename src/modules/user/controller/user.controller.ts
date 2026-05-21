import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { UserService } from '@/user/service/user.service';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  UserResponse,
} from '@/user/dto';
import {
  PaginationRequest,
  ApiResponse,
  PaginationResponse,
  IdRequest,
  BulkStatusUpdateRequest,
} from '@/common/dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('me')
  async me(@CurrentUser() currentUser: any) {
    const user = await this.userService.getProfile(currentUser.id);
    // Attach permissions from the JWT strategy (already correctly resolved)
    const result = plainToInstance(UserResponse, user);
    (result as any).permissions = currentUser.permissions || [];
    return ApiResponse.success(result, 'User profile retrieved successfully');
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
  async detail(@Body() dto: IdRequest) {
    const user = await this.userService.findOne(dto.id);
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

  @Post('status-update')
  @Permissions('user:update')
  async updateStatus(
    @Body() dto: { id: number; status: boolean },
    @CurrentUser('id') userId: number,
  ) {
    await this.userService.updateStatus(dto.id, dto.status, userId);
    return ApiResponse.success(null, 'User status updated successfully');
  }

  @Post('soft-delete')
  @Permissions('user:delete')
  async softDelete(@Body() dto: IdRequest, @CurrentUser('id') userId: number) {
    await this.userService.softDelete(dto.id, userId);
    return ApiResponse.success(null, 'User soft deleted successfully');
  }

  @Post('force-delete')
  @Permissions('user:delete')
  async forceDelete(@Body() dto: IdRequest) {
    await this.userService.forceDelete(dto.id);
    return ApiResponse.success(null, 'User deleted successfully');
  }

  @Post('bulk-status-update')
  @Permissions('user:update')
  async bulkUpdateStatus(
    @Body() dto: BulkStatusUpdateRequest,
    @CurrentUser('id') userId: number,
  ) {
    await this.userService.bulkUpdateStatus(dto.ids, dto.status, userId);
    return ApiResponse.success(null, 'User statuses updated successfully');
  }

  @Post('update-profile')
  async updateProfile(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateProfileRequest,
  ) {
    const user = await this.userService.updateProfile(userId, dto);
    return ApiResponse.success(
      plainToInstance(UserResponse, user),
      'Profile updated successfully',
    );
  }

  @Post('change-password')
  async changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordRequest,
  ) {
    await this.userService.changePassword(userId, dto);
    return ApiResponse.success(null, 'Password changed successfully');
  }

  @Post('reset-password')
  @Permissions('user:update')
  async resetPassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ResetPasswordRequest,
  ) {
    await this.userService.resetPassword(dto, userId);
    return ApiResponse.success(null, 'User password reset successfully');
  }
}
