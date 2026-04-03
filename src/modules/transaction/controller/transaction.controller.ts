import { Controller, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '@/common/security/decorator/current_user.decorator';
import { Permissions } from '@/common/security/decorator/permissions.decorator';
import { TransactionService } from '../service/transaction.service';
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionResponse,
} from '../dto';
import {
  PaginationRequest,
  ApiResponse,
  PaginationResponse,
} from '@/common/dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create')
  @Permissions('transaction:create')
  async create(
    @Body() dto: CreateTransactionRequest,
    @CurrentUser('id') userId: number,
  ) {
    const transaction = await this.transactionService.create(dto, userId);
    return ApiResponse.success(
        plainToInstance(TransactionResponse, transaction), 
        'Transaction recorded successfully'
    );
  }

  @Post('list')
  @Permissions('transaction:all')
  async list(@Body() pagination: PaginationRequest) {
    const [data, meta] =
      await this.transactionService.findAllWithPagination(pagination);
    return ApiResponse.success(
      new PaginationResponse(plainToInstance(TransactionResponse, data), meta),
      'Transaction list retrieved successfully',
    );
  }

  @Post('detail')
  @Permissions('transaction:view')
  async detail(@Body('id') id: number) {
    const transaction = await this.transactionService.findOne(id);
    return ApiResponse.success(
      plainToInstance(TransactionResponse, transaction),
      'Transaction detail retrieved successfully',
    );
  }

  @Post('update')
  @Permissions('transaction:update')
  async update(
    @Body() dto: UpdateTransactionRequest,
    @CurrentUser('id') userId: number,
  ) {
    const transaction = await this.transactionService.update(dto, userId);
    return ApiResponse.success(
        plainToInstance(TransactionResponse, transaction), 
        'Transaction updated successfully'
    );
  }

  @Post('soft-delete')
  @Permissions('transaction:delete')
  async softDelete(@Body('id') id: number, @CurrentUser('id') userId: number) {
    await this.transactionService.softDelete(id, userId);
    return ApiResponse.success(null, 'Transaction deleted successfully');
  }
}
