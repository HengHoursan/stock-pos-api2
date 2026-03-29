import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DiscountRepository } from '../repository/discount.repository';
import { CreateDiscountRequest, UpdateDiscountRequest } from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { Discount } from '../entity/discount.entity';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class DiscountService {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async create(
    dto: CreateDiscountRequest,
    currentUserId: number | null = null,
  ): Promise<Discount> {
    // Check if code already exists
    if (dto.code && dto.code.trim() !== '') {
      const existingCode = await this.discountRepository.findByCode(dto.code);
      if (existingCode) {
        throw new ConflictException(
          `Discount with code "${dto.code}" already exists`,
        );
      }
    }

    const code = dto.code?.trim() || generateCode('DSCNT');

    const discount = this.discountRepository.create({
      code,
      discountType: dto.discountType,
      discountAmount: dto.discountAmount,
      discountStartDate: DateConvertor(dto.discountStartDate) as Date,
      discountEndDate: DateConvertor(dto.discountEndDate) as Date,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.discountRepository.save(discount);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Discount[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.discountRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Discount[]> {
    return this.discountRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Discount> {
    const discount = await this.discountRepository.findOne({
      where: { id },
    });
    if (!discount) {
      throw new NotFoundException(`Discount with id ${id} not found`);
    }
    return discount;
  }

  async update(
    dto: UpdateDiscountRequest,
    currentUserId: number | null = null,
  ): Promise<Discount> {
    const discount = await this.findOne(dto.id);

    if (dto.code !== undefined && dto.code.trim() === '') {
      delete dto.code;
    }

    if (dto.code && dto.code !== discount.code) {
      if (await this.discountRepository.findByCode(dto.code)) {
        throw new ConflictException(
          `Discount with code "${dto.code}" already exists`,
        );
      }
    }

    const updateData: any = { ...dto };
    if (dto.discountStartDate) {
      updateData.discountStartDate = DateConvertor(dto.discountStartDate);
    }
    if (dto.discountEndDate) {
      updateData.discountEndDate = DateConvertor(dto.discountEndDate);
    }

    Object.assign(discount, updateData);
    discount.updatedBy = currentUserId;

    return this.discountRepository.save(discount);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const discount = await this.findOne(id);
    discount.deletedBy = currentUserId;
    await this.discountRepository.save(discount);
    await this.discountRepository.softRemove(discount);
  }
}
