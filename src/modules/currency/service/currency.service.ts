import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CurrencyRepository } from '@/currency/repository/currency.repository';
import {
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
  UpdateCurrencyStatusRequest,
} from '@/currency/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { Currency } from '@/currency/entity/currency.entity';
import { generateCode } from '@/common/util/helper';

@Injectable()
export class CurrencyService {
  constructor(
    private readonly currencyRepository: CurrencyRepository,
  ) {}

  async create(
    dto: CreateCurrencyRequest,
    currentUserId: number | null = null,
  ): Promise<Currency> {
    const code = dto.code ?? generateCode('CURR');

    // Check if code already exists
    const existingCode = await this.currencyRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(`Currency with code "${code}" already exists`);
    }

    const currency = this.currencyRepository.create({
      ...dto,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.currencyRepository.save(currency);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Currency[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.currencyRepository.findAllWithPagination(pagination);
    
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Currency[]> {
    return this.currencyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({
      where: { id },
    });
    if (!currency) {
      throw new NotFoundException(`Currency with id ${id} not found`);
    }
    return currency;
  }

  async update(
    dto: UpdateCurrencyRequest,
    currentUserId: number | null = null,
  ): Promise<Currency> {
    const currency = await this.findOne(dto.id);

    if (dto.code && dto.code !== currency.code) {
      if (await this.currencyRepository.findByCode(dto.code)) {
        throw new ConflictException(
          `Currency with code "${dto.code}" already exists`,
        );
      }
    }

    Object.assign(currency, dto);
    currency.updatedBy = currentUserId;

    return this.currencyRepository.save(currency);
  }

  async updateStatus(
    dto: UpdateCurrencyStatusRequest,
    currentUserId: number | null = null,
  ): Promise<Currency> {
    const currency = await this.findOne(dto.id);
    currency.status = dto.status;
    currency.updatedBy = currentUserId;
    return this.currencyRepository.save(currency);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const currency = await this.findOne(id);
    currency.deletedBy = currentUserId;
    await this.currencyRepository.save(currency);
    await this.currencyRepository.softRemove(currency);
  }

  async forceDelete(id: number): Promise<void> {
    const result = await this.currencyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Currency with id ${id} not found`);
    }
  }
}
