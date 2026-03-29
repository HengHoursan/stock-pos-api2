import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UnitRepository } from '@/unit/repository/unit.repository';
import {
  CreateUnitRequest,
  UpdateUnitRequest,
  UpdateUnitStatusRequest,
} from '@/unit/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { Unit } from '@/unit/entity/unit.entity';
import { generateCode, slugify } from '@/common/util/helper';

@Injectable()
export class UnitService {
  constructor(
    private readonly unitRepository: UnitRepository,
  ) {}

  async create(
    dto: CreateUnitRequest,
    currentUserId: number | null = null,
  ): Promise<Unit> {
    const name = dto.name;
    const code = dto.code?.trim() || generateCode('UNIT');
    const slug = dto.slug?.trim() || slugify(name);

    // Check if name or code already exists
    const existingName = await this.unitRepository.findByName(name);
    if (existingName) {
      throw new ConflictException(`Unit with name "${name}" already exists`);
    }

    if (code && code.trim() !== '') {
      const existingCode = await this.unitRepository.findByCode(code);
      if (existingCode) {
        throw new ConflictException(`Unit with code "${code}" already exists`);
      }
    }

    const unit = this.unitRepository.create({
      ...dto,
      code,
      slug,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.unitRepository.save(unit);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Unit[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.unitRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Unit[]> {
    return this.unitRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Unit> {
    const unit = await this.unitRepository.findOne({
      where: { id },
    });
    if (!unit) {
      throw new NotFoundException(`Unit with id ${id} not found`);
    }
    return unit;
  }

  async update(
    dto: UpdateUnitRequest,
    currentUserId: number | null = null,
  ): Promise<Unit> {
    const unit = await this.findOne(dto.id);

    if (dto.name && dto.name !== unit.name) {
      if (await this.unitRepository.findByName(dto.name)) {
        throw new ConflictException(
          `Unit with name "${dto.name}" already exists`,
        );
      }
      if (!dto.slug || dto.slug.trim() === '') {
        dto.slug = slugify(dto.name);
      }
    }

    if (dto.slug !== undefined && dto.slug.trim() === '') {
      dto.slug = slugify(unit.name);
    }

    if (dto.code !== undefined && dto.code.trim() === '') {
      delete dto.code; // Don't update to empty string
    }

    if (dto.code && dto.code !== unit.code) {
      if (await this.unitRepository.findByCode(dto.code)) {
        throw new ConflictException(
          `Unit with code "${dto.code}" already exists`,
        );
      }
    }

    Object.assign(unit, dto);
    unit.updatedBy = currentUserId;

    return this.unitRepository.save(unit);
  }

  async updateStatus(
    dto: UpdateUnitStatusRequest,
    currentUserId: number | null = null,
  ): Promise<Unit> {
    const unit = await this.findOne(dto.id);
    unit.status = dto.status;
    unit.updatedBy = currentUserId;
    return this.unitRepository.save(unit);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const unit = await this.findOne(id);
    unit.deletedBy = currentUserId;
    await this.unitRepository.save(unit);
    await this.unitRepository.softRemove(unit);
  }

  async forceDelete(id: number): Promise<void> {
    const result = await this.unitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Unit with id ${id} not found`);
    }
  }
}
