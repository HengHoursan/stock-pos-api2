import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PurchaseQuotationRepository } from '../repository/purchase_quotation.repository';
import {
  CreatePurchaseQuotationRequest,
  UpdatePurchaseQuotationRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { PurchaseQuotation } from '../entity/purchase_quotation.entity';
import { PurchaseQuotationDetail } from '../entity/purchase_quotation_detail.entity';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class PurchaseQuotationService {
  constructor(
    private readonly purchaseQuotationRepository: PurchaseQuotationRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreatePurchaseQuotationRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseQuotation> {
    const code = dto.code?.trim() || generateCode('PQUO');

    const existingCode = await this.purchaseQuotationRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(`Purchase Quotation with code "${code}" already exists`);
    }

    return await this.dataSource.transaction(async (manager) => {
      const quotation = manager.create(PurchaseQuotation, {
        code,
        quotationDate: DateConvertor(dto.quotationDate) || new Date(),
        description: dto.description,
        totalLine: dto.details?.length || 0,
        totalPrice: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedQuotation = await manager.save(PurchaseQuotation, quotation);

      let totalPrice = 0;
      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(PurchaseQuotationDetail, {
            purchaseQuotationId: savedQuotation.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchaseQuotationDetail, detail);
          totalPrice += Number(item.totalPrice);
        }
      }

      savedQuotation.totalPrice = totalPrice;
      await manager.save(PurchaseQuotation, savedQuotation);

      return manager.findOne(PurchaseQuotation, {
        where: { id: savedQuotation.id },
        relations: ['details', 'details.product'],
      }) as Promise<PurchaseQuotation>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseQuotation[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.purchaseQuotationRepository.findAllWithPagination(pagination);

    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<PurchaseQuotation[]> {
    return this.purchaseQuotationRepository.find({
      relations: ['details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PurchaseQuotation> {
    const quotation = await this.purchaseQuotationRepository.findOne({
      where: { id },
      relations: ['details', 'details.product'],
    });
    if (!quotation) {
      throw new NotFoundException(`Purchase Quotation with id ${id} not found`);
    }
    return quotation;
  }

  async update(
    dto: UpdatePurchaseQuotationRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseQuotation> {
    const quotation = await this.findOne(dto.id);

    if (dto.code && dto.code !== quotation.code) {
      const existing = await this.purchaseQuotationRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Purchase Quotation with code "${dto.code}" already exists`);
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) quotation.code = dto.code;
      if (dto.quotationDate) quotation.quotationDate = DateConvertor(dto.quotationDate) || quotation.quotationDate;
      if (dto.description !== undefined) quotation.description = dto.description;
      quotation.updatedBy = currentUserId;

      if (dto.details) {
        // Delete existing details
        await manager.delete(PurchaseQuotationDetail, { purchaseQuotationId: quotation.id });

        // Re-insert details
        let totalPrice = 0;
        for (const item of dto.details) {
          const detail = manager.create(PurchaseQuotationDetail, {
            purchaseQuotationId: quotation.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchaseQuotationDetail, detail);
          totalPrice += Number(item.totalPrice);
        }

        quotation.totalLine = dto.details.length;
        quotation.totalPrice = totalPrice;
      }

      await manager.save(PurchaseQuotation, quotation);

      return manager.findOne(PurchaseQuotation, {
        where: { id: quotation.id },
        relations: ['details', 'details.product'],
      }) as Promise<PurchaseQuotation>;
    });
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const quotation = await this.findOne(id);
    quotation.deletedBy = currentUserId;
    await this.purchaseQuotationRepository.save(quotation);
    await this.purchaseQuotationRepository.softRemove(quotation);
  }

  async forceDelete(id: number): Promise<void> {
    const quotation = await this.findOne(id);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(PurchaseQuotationDetail, { purchaseQuotationId: id });
      await manager.delete(PurchaseQuotation, id);
    });
  }

  async duplicate(
    id: number,
    currentUserId: number | null = null,
  ): Promise<PurchaseQuotation> {
    const source = await this.findOne(id);
    const code = generateCode('PQUO');

    return await this.dataSource.transaction(async (manager) => {
      const quotation = manager.create(PurchaseQuotation, {
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
      const savedQuotation = await manager.save(PurchaseQuotation, quotation);

      if (source.details && source.details.length > 0) {
        for (const item of source.details) {
          const detail = manager.create(PurchaseQuotationDetail, {
            ...item,
            id: undefined,
            purchaseQuotationId: savedQuotation.id,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchaseQuotationDetail, detail);
        }
      }

      return manager.findOne(PurchaseQuotation, {
        where: { id: savedQuotation.id },
        relations: ['details', 'details.product'],
      }) as Promise<PurchaseQuotation>;
    });
  }

  async bulkSoftDelete(
    ids: number[],
    currentUserId: number | null = null,
  ): Promise<void> {
    const quotations = await this.purchaseQuotationRepository.createQueryBuilder('q')
      .where('q.id IN (:...ids)', { ids })
      .getMany();

    for (const quotation of quotations) {
      quotation.deletedBy = currentUserId;
      await this.purchaseQuotationRepository.save(quotation);
    }
    await this.purchaseQuotationRepository.softRemove(quotations);
  }
}
