import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CustomerRepository } from '../repository/customer.repository';
import {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  UpdateCustomerStatusRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { Customer } from '../entity/customer.entity';
import { generateCode } from '@/common/util/helper';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(
    dto: CreateCustomerRequest,
    currentUserId: number | null = null,
  ): Promise<Customer> {
    const name = dto.name;
    const code = dto.code?.trim() || generateCode('CUST');

    // Check if name or code already exists
    const existingName = await this.customerRepository.findByName(name);
    if (existingName) {
      throw new ConflictException(`Customer with name "${name}" already exists`);
    }

    if (code && code.trim() !== '') {
      const existingCode = await this.customerRepository.findByCode(code);
      if (existingCode) {
        throw new ConflictException(`Customer with code "${code}" already exists`);
      }
    }

    const customer = this.customerRepository.create({
      ...dto,
      code,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.customerRepository.save(customer);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Customer[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.customerRepository.findAllWithPagination(pagination);
    
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return customer;
  }

  async update(
    dto: UpdateCustomerRequest,
    currentUserId: number | null = null,
  ): Promise<Customer> {
    const customer = await this.findOne(dto.id);

    if (dto.name && dto.name !== customer.name) {
      if (await this.customerRepository.findByName(dto.name)) {
        throw new ConflictException(
          `Customer with name "${dto.name}" already exists`,
        );
      }
    }

    if (dto.code && dto.code !== customer.code) {
      if (await this.customerRepository.findByCode(dto.code)) {
        throw new ConflictException(
          `Customer with code "${dto.code}" already exists`,
        );
      }
    }

    Object.assign(customer, dto);
    customer.updatedBy = currentUserId;

    return this.customerRepository.save(customer);
  }

  async updateStatus(
    dto: UpdateCustomerStatusRequest,
    currentUserId: number | null = null,
  ): Promise<Customer> {
    const customer = await this.findOne(dto.id);
    customer.status = dto.status;
    customer.updatedBy = currentUserId;
    return this.customerRepository.save(customer);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const customer = await this.findOne(id);
    customer.deletedBy = currentUserId;
    await this.customerRepository.save(customer);
    await this.customerRepository.softRemove(customer);
  }

  async forceDelete(id: number): Promise<void> {
    const result = await this.customerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
  }
}
