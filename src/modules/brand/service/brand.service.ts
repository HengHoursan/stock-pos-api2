import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BrandRepository } from '@/brand/repository/brand.repository';
import {
  CreateBrandRequest,
  UpdateBrandRequest,
  UpdateBrandStatusRequest,
} from '@/brand/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { Brand } from '@/brand/entity/brand.entity';
import { generateCode, slugify } from '@/common/util/helper';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async create(
    dto: CreateBrandRequest,
    currentUserId: number | null = null,
  ): Promise<Brand> {
    const name = dto.name;
    const code = dto.code ?? generateCode('BRND');
    const slug = dto.slug ?? slugify(name);

    // Check if name or code already exists
    const existingName = await this.brandRepository.findByName(name);
    if (existingName) {
      throw new ConflictException(`Brand with name "${name}" already exists`);
    }

    const existingCode = await this.brandRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(`Brand with code "${code}" already exists`);
    }

    const brand = this.brandRepository.create({
      ...dto,
      code,
      slug,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.brandRepository.save(brand);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Brand[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.brandRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Brand[]> {
    return this.brandRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });
    if (!brand) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }
    return brand;
  }

  async update(
    dto: UpdateBrandRequest,
    currentUserId: number | null = null,
  ): Promise<Brand> {
    const brand = await this.findOne(dto.id);

    if (dto.name && dto.name !== brand.name) {
      if (await this.brandRepository.findByName(dto.name)) {
        throw new ConflictException(
          `Brand with name "${dto.name}" already exists`,
        );
      }
      if (!dto.slug) {
        dto.slug = slugify(dto.name);
      }
    }

    if (dto.code && dto.code !== brand.code) {
      if (await this.brandRepository.findByCode(dto.code)) {
        throw new ConflictException(
          `Brand with code "${dto.code}" already exists`,
        );
      }
    }

    Object.assign(brand, dto);
    brand.updatedBy = currentUserId;

    return this.brandRepository.save(brand);
  }

  async updateStatus(
    dto: UpdateBrandStatusRequest,
    currentUserId: number | null = null,
  ): Promise<Brand> {
    const brand = await this.findOne(dto.id);
    brand.status = dto.status;
    brand.updatedBy = currentUserId;
    return this.brandRepository.save(brand);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const brand = await this.findOne(id);
    brand.deletedBy = currentUserId;
    await this.brandRepository.save(brand);
    await this.brandRepository.softRemove(brand);
  }

  async forceDelete(id: number): Promise<void> {
    const result = await this.brandRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }
  }
}
