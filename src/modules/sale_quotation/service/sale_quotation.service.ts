import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaleQuotationRepository } from '@/sale_quotation/repository/sale_quotation.repository';
import { CreateSaleQuotationRequest, UpdateSaleQuotationRequest } from '@/sale_quotation/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { SaleQuotation } from '@/sale_quotation/entity/sale_quotation.entity';
import { SaleQuotationDetail } from '@/sale_quotation/entity/sale_quotation_detail.entity';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class SaleQuotationService {
  constructor(
    private readonly saleQuotationRepository: SaleQuotationRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateSaleQuotationRequest,
    currentUserId: number | null = null,
  ): Promise<SaleQuotation> {
    const code = dto.code?.trim() || generateCode('SQUT');

    const existingCode = await this.saleQuotationRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(`Sale Quotation with code "${code}" already exists`);
    }

    return await this.dataSource.transaction(async (manager) => {
      const quotation = manager.create(SaleQuotation, {
        code,
        customerId: dto.customerId,
        quotationDate: DateConvertor(dto.quotationDate) || new Date(),
        description: dto.description,
        totalLine: dto.details?.length || 0,
        totalPrice: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedQuotation = await manager.save(SaleQuotation, quotation);

      let totalPrice = 0;

      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(SaleQuotationDetail, {
            saleQuotationId: savedQuotation.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          });
          await manager.save(SaleQuotationDetail, detail);
          totalPrice += Number(item.totalPrice);
        }
      }

      savedQuotation.totalPrice = totalPrice;
      await manager.save(SaleQuotation, savedQuotation);

      return manager.findOne(SaleQuotation, {
        where: { id: savedQuotation.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleQuotation>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleQuotation[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.saleQuotationRepository.findAllWithPagination(pagination);
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<SaleQuotation[]> {
    return this.saleQuotationRepository.find({
      relations: ['customer', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SaleQuotation> {
    const quotation = await this.saleQuotationRepository.findOne({
      where: { id },
      relations: ['customer', 'details', 'details.product'],
    });
    if (!quotation) {
      throw new NotFoundException(`Sale Quotation with id ${id} not found`);
    }
    return quotation;
  }

  async update(
    dto: UpdateSaleQuotationRequest,
    currentUserId: number | null = null,
  ): Promise<SaleQuotation> {
    const quotation = await this.findOne(dto.id);

    if (dto.code && dto.code !== quotation.code) {
      const existing = await this.saleQuotationRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Sale Quotation with code "${dto.code}" already exists`);
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) quotation.code = dto.code;
      if (dto.customerId) quotation.customerId = dto.customerId;
      if (dto.quotationDate) quotation.quotationDate = DateConvertor(dto.quotationDate) || quotation.quotationDate;
      if (dto.description !== undefined) quotation.description = dto.description;
      quotation.updatedBy = currentUserId;

      if (dto.details) {
        await manager.delete(SaleQuotationDetail, { saleQuotationId: quotation.id });

        let totalPrice = 0;
        for (const item of dto.details) {
          const detail = manager.create(SaleQuotationDetail, {
            saleQuotationId: quotation.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          });
          await manager.save(SaleQuotationDetail, detail);
          totalPrice += Number(item.totalPrice);
        }

        quotation.totalLine = dto.details.length;
        quotation.totalPrice = totalPrice;
      }

      await manager.save(SaleQuotation, quotation);

      return manager.findOne(SaleQuotation, {
        where: { id: quotation.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleQuotation>;
    });
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const quotation = await this.findOne(id);
    quotation.deletedBy = currentUserId;
    await this.saleQuotationRepository.save(quotation);
    await this.saleQuotationRepository.softRemove(quotation);
  }

  async forceDelete(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(SaleQuotationDetail, { saleQuotationId: id });
      await manager.delete(SaleQuotation, id);
    });
  }

  async duplicate(
    id: number,
    currentUserId: number | null = null,
  ): Promise<SaleQuotation> {
    const source = await this.findOne(id);
    const code = generateCode('SQUT');

    return await this.dataSource.transaction(async (manager) => {
      const quotation = manager.create(SaleQuotation, {
        ...source,
        id: undefined,
        code,
        quotationDate: new Date(),
        createdBy: currentUserId,
        updatedBy: currentUserId,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
        details: undefined,
      });
      const savedQuotation = await manager.save(SaleQuotation, quotation);

      if (source.details && source.details.length > 0) {
        for (const item of source.details) {
          const detail = manager.create(SaleQuotationDetail, {
            ...item,
            id: undefined,
            saleQuotationId: savedQuotation.id,
          });
          await manager.save(SaleQuotationDetail, detail);
        }
      }

      return manager.findOne(SaleQuotation, {
        where: { id: savedQuotation.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleQuotation>;
    });
  }

  async bulkSoftDelete(
    ids: number[],
    currentUserId: number | null = null,
  ): Promise<void> {
    const quotations = await this.saleQuotationRepository.createQueryBuilder('q')
      .where('q.id IN (:...ids)', { ids })
      .getMany();

    for (const quotation of quotations) {
      quotation.deletedBy = currentUserId;
      await this.saleQuotationRepository.save(quotation);
    }
    await this.saleQuotationRepository.softRemove(quotations);
  }
}
