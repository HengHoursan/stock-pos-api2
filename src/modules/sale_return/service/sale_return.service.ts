import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SaleReturnRepository } from '@/sale_return/repository/sale_return.repository';
import { StockService } from '@/product/service/stock.service';
import {
  CreateSaleReturnRequest,
  UpdateSaleReturnRequest,
  UpdateSaleReturnStatusRequest,
} from '@/sale_return/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { SaleReturn } from '@/sale_return/entity/sale_return.entity';
import { SaleReturnDetail } from '@/sale_return/entity/sale_return_detail.entity';
import { InvoiceStatus } from '@/common/enum/invoice_status.enum';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class SaleReturnService {
  constructor(
    private readonly saleReturnRepository: SaleReturnRepository,
    private readonly stockService: StockService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateSaleReturnRequest,
    currentUserId: number | null = null,
  ): Promise<SaleReturn> {
    const code = dto.code?.trim() || generateCode('SRET');

    const existingCode = await this.saleReturnRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(
        `Sale Return with code "${code}" already exists`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const saleReturn = manager.create(SaleReturn, {
        code,
        customerId: dto.customerId,
        returnDate: (DateConvertor(dto.returnDate) as Date) || new Date(),
        description: dto.description,
        status: InvoiceStatus.DRAFT,
        isCancel: false,
        totalLine: dto.details?.length || 0,
        totalPrice: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedReturn = await manager.save(SaleReturn, saleReturn);

      let totalPrice = 0;

      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(SaleReturnDetail, {
            saleReturnId: savedReturn.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          });
          await manager.save(SaleReturnDetail, detail);
          totalPrice += Number(item.totalPrice);

          // Stock IN — customer returns goods, stock increases
          await this.stockService.adjustStock(
            manager,
            item.productId,
            item.quantity,
            'IN',
            `Sale Return: ${code}`,
            currentUserId,
            (DateConvertor(dto.returnDate) as Date) || new Date(),
          );
        }
      }

      savedReturn.totalPrice = totalPrice;
      await manager.save(SaleReturn, savedReturn);

      return manager.findOne(SaleReturn, {
        where: { id: savedReturn.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleReturn>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleReturn[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.saleReturnRepository.findAllWithPagination(pagination);
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<SaleReturn[]> {
    return this.saleReturnRepository.find({
      relations: ['customer', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SaleReturn> {
    const saleReturn = await this.saleReturnRepository.findOne({
      where: { id },
      relations: ['customer', 'details', 'details.product'],
    });
    if (!saleReturn) {
      throw new NotFoundException(`Sale Return with id ${id} not found`);
    }
    return saleReturn;
  }

  async update(
    dto: UpdateSaleReturnRequest,
    currentUserId: number | null = null,
  ): Promise<SaleReturn> {
    const saleReturn = await this.findOne(dto.id);

    if (saleReturn.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot edit a sale return that is not in DRAFT status',
      );
    }

    if (dto.code && dto.code !== saleReturn.code) {
      const existing = await this.saleReturnRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(
          `Sale Return with code "${dto.code}" already exists`,
        );
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) saleReturn.code = dto.code;
      if (dto.customerId) saleReturn.customerId = dto.customerId;
      if (dto.returnDate)
        saleReturn.returnDate =
          (DateConvertor(dto.returnDate) as Date) || saleReturn.returnDate;
      if (dto.description !== undefined)
        saleReturn.description = dto.description;
      saleReturn.updatedBy = currentUserId;

      if (dto.details) {
        // Reverse stock for old return details (STOCK OUT — undo the IN)
        for (const oldDetail of saleReturn.details) {
          await this.stockService.adjustStock(
            manager,
            oldDetail.productId,
            oldDetail.quantity,
            'OUT',
            `Reversed - Sale Return Update: ${saleReturn.code}`,
            currentUserId,
          );
        }

        await manager.delete(SaleReturnDetail, { saleReturnId: saleReturn.id });

        let totalPrice = 0;
        for (const item of dto.details) {
          const detail = manager.create(SaleReturnDetail, {
            saleReturnId: saleReturn.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          });
          await manager.save(SaleReturnDetail, detail);
          totalPrice += Number(item.totalPrice);

          // Stock IN for new details
          await this.stockService.adjustStock(
            manager,
            item.productId,
            item.quantity,
            'IN',
            `Sale Return Update: ${saleReturn.code}`,
            currentUserId,
            saleReturn.returnDate || new Date(),
          );
        }

        saleReturn.totalLine = dto.details.length;
        saleReturn.totalPrice = totalPrice;
      }

      await manager.save(SaleReturn, saleReturn);

      return manager.findOne(SaleReturn, {
        where: { id: saleReturn.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleReturn>;
    });
  }

  async updateStatus(
    dto: UpdateSaleReturnStatusRequest,
    currentUserId: number | null = null,
  ): Promise<SaleReturn> {
    const saleReturn = await this.findOne(dto.id);
    saleReturn.status = dto.status;
    if (dto.status === InvoiceStatus.CANCELLED) {
      saleReturn.isCancel = true;
    }
    saleReturn.updatedBy = currentUserId;
    return this.saleReturnRepository.save(saleReturn);
  }

  async cancel(
    id: number,
    currentUserId: number | null = null,
  ): Promise<SaleReturn> {
    const saleReturn = await this.findOne(id);
    if (saleReturn.status === InvoiceStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed sale return');
    }

    return await this.dataSource.transaction(async (manager) => {
      saleReturn.isCancel = true;
      saleReturn.status = InvoiceStatus.CANCELLED;
      saleReturn.updatedBy = currentUserId;

      // Reverse stock (STOCK OUT — undo the original IN from customer return)
      for (const detail of saleReturn.details) {
        await this.stockService.adjustStock(
          manager,
          detail.productId,
          detail.quantity,
          'OUT',
          `Cancelled - Sale Return: ${saleReturn.code}`,
          currentUserId,
        );
      }

      await manager.save(SaleReturn, saleReturn);
      return saleReturn;
    });
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const saleReturn = await this.findOne(id);
    saleReturn.deletedBy = currentUserId;
    await this.saleReturnRepository.save(saleReturn);
    await this.saleReturnRepository.softRemove(saleReturn);
  }

  async forceDelete(id: number): Promise<void> {
    await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(SaleReturnDetail, { saleReturnId: id });
      await manager.delete(SaleReturn, id);
    });
  }
}
