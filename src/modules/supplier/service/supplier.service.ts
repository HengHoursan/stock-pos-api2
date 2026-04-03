import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupplierRepository } from '../repository/supplier.repository';
import {
  CreateSupplierRequest,
  UpdateSupplierRequest,
  UpdateSupplierStatusRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { Supplier } from '../entity/supplier.entity';
import { generateCode } from '@/common/util/helper';

@Injectable()
export class SupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async create(
    dto: CreateSupplierRequest,
    currentUserId: number | null = null,
  ): Promise<Supplier> {
    const name = dto.name;
    const code = dto.code?.trim() || generateCode('SUPP');

    // Check if name or code already exists
    const existingName = await this.supplierRepository.findByName(name);
    if (existingName) {
      throw new ConflictException(`Supplier with name "${name}" already exists`);
    }

    if (code && code.trim() !== '') {
      const existingCode = await this.supplierRepository.findByCode(code);
      if (existingCode) {
        throw new ConflictException(`Supplier with code "${code}" already exists`);
      }
    }

    const supplier = this.supplierRepository.create({
      ...dto,
      code,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.supplierRepository.save(supplier);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Supplier[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.supplierRepository.findAllWithPagination(pagination);
    
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }
    return supplier;
  }

  async update(
    dto: UpdateSupplierRequest,
    currentUserId: number | null = null,
  ): Promise<Supplier> {
    const supplier = await this.findOne(dto.id);

    if (dto.name && dto.name !== supplier.name) {
      if (await this.supplierRepository.findByName(dto.name)) {
        throw new ConflictException(
          `Supplier with name "${dto.name}" already exists`,
        );
      }
    }

    if (dto.code && dto.code !== supplier.code) {
      if (await this.supplierRepository.findByCode(dto.code)) {
        throw new ConflictException(
          `Supplier with code "${dto.code}" already exists`,
        );
      }
    }

    Object.assign(supplier, dto);
    supplier.updatedBy = currentUserId;

    return this.supplierRepository.save(supplier);
  }

  async updateStatus(
    dto: UpdateSupplierStatusRequest,
    currentUserId: number | null = null,
  ): Promise<Supplier> {
    const supplier = await this.findOne(dto.id);
    supplier.status = dto.status;
    supplier.updatedBy = currentUserId;
    return this.supplierRepository.save(supplier);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const supplier = await this.findOne(id);
    supplier.deletedBy = currentUserId;
    await this.supplierRepository.save(supplier);
    await this.supplierRepository.softRemove(supplier);
  }

  async forceDelete(id: number): Promise<void> {
    const result = await this.supplierRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }
  }
}
