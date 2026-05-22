import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PurchaseReturnRepository } from '../repository/purchase_return.repository';
import { StockService } from '../../product/service/stock.service';
import {
  CreatePurchaseReturnRequest,
  UpdatePurchaseReturnRequest,
  UpdatePurchaseReturnStatusRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '../../../common/dto';
import { PurchaseReturn } from '../entity/purchase_return.entity';
import { PurchaseReturnDetail } from '../entity/purchase_return_detail.entity';
import { InvoiceStatus } from '../../../common/enum/invoice_status.enum';
import { generateCode, DateConvertor } from '../../../common/util/helper';

@Injectable()
export class PurchaseReturnService {
  constructor(
    private readonly purchaseReturnRepository: PurchaseReturnRepository,
    private readonly stockService: StockService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreatePurchaseReturnRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseReturn> {
    const code = dto.code?.trim() || generateCode('PREX');

    const existingCode = await this.purchaseReturnRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(
        `Purchase Return with code "${code}" already exists`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const purchaseReturn = manager.create(PurchaseReturn, {
        code,
        supplierId: dto.supplierId,
        returnDate: DateConvertor(dto.returnDate) || new Date(),
        description: dto.description,
        status: InvoiceStatus.DRAFT,
        isCancel: false,
        totalLine: dto.details?.length || 0,
        totalPrice: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedReturn = await manager.save(PurchaseReturn, purchaseReturn);

      let totalPrice = 0;

      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(PurchaseReturnDetail, {
            purchaseReturnId: savedReturn.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            purchaseInvoiceId: item.purchaseInvoiceId || null,
            purchaseInvoiceDetailId: item.purchaseInvoiceDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchaseReturnDetail, detail);
          totalPrice += Number(item.totalPrice);

          // Stock OUT — returning goods to supplier reduces stock
          await this.stockService.adjustStock(
            manager,
            item.productId,
            item.quantity,
            'OUT',
            `Purchase Return: ${code}`,
            currentUserId,
            DateConvertor(dto.returnDate) || new Date(),
          );
        }
      }

      savedReturn.totalPrice = totalPrice;
      await manager.save(PurchaseReturn, savedReturn);

      return manager.findOne(PurchaseReturn, {
        where: { id: savedReturn.id },
        relations: ['supplier', 'details', 'details.product'],
      }) as Promise<PurchaseReturn>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseReturn[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.purchaseReturnRepository.findAllWithPagination(pagination);
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<PurchaseReturn[]> {
    return this.purchaseReturnRepository.find({
      relations: ['supplier', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PurchaseReturn> {
    const pr = await this.purchaseReturnRepository.findOne({
      where: { id },
      relations: ['supplier', 'details', 'details.product'],
    });
    if (!pr) {
      throw new NotFoundException(`Purchase Return with id ${id} not found`);
    }
    return pr;
  }

  async update(
    dto: UpdatePurchaseReturnRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseReturn> {
    const purchaseReturn = await this.findOne(dto.id);

    if (purchaseReturn.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot edit a purchase return that is not in DRAFT status',
      );
    }

    if (dto.code && dto.code !== purchaseReturn.code) {
      const existing = await this.purchaseReturnRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(
          `Purchase Return with code "${dto.code}" already exists`,
        );
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) purchaseReturn.code = dto.code;
      if (dto.supplierId) purchaseReturn.supplierId = dto.supplierId;
      if (dto.returnDate)
        purchaseReturn.returnDate =
          DateConvertor(dto.returnDate) || purchaseReturn.returnDate;
      if (dto.description !== undefined)
        purchaseReturn.description = dto.description;
      purchaseReturn.updatedBy = currentUserId;

      if (dto.details) {
        // Reverse stock for old return details (STOCK IN)
        for (const oldDetail of purchaseReturn.details) {
          await this.stockService.adjustStock(
            manager,
            oldDetail.productId,
            oldDetail.quantity,
            'IN',
            `Reversed - Purchase Return Update: ${purchaseReturn.code}`,
            currentUserId,
          );
        }

        await manager.delete(PurchaseReturnDetail, {
          purchaseReturnId: purchaseReturn.id,
        });

        let totalPrice = 0;
        for (const item of dto.details) {
          const detail = manager.create(PurchaseReturnDetail, {
            purchaseReturnId: purchaseReturn.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            purchaseInvoiceId: item.purchaseInvoiceId || null,
            purchaseInvoiceDetailId: item.purchaseInvoiceDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchaseReturnDetail, detail);
          totalPrice += Number(item.totalPrice);

          // Stock OUT for new details
          await this.stockService.adjustStock(
            manager,
            item.productId,
            item.quantity,
            'OUT',
            `Purchase Return Update: ${purchaseReturn.code}`,
            currentUserId,
            purchaseReturn.returnDate || new Date(),
          );
        }

        purchaseReturn.totalLine = dto.details.length;
        purchaseReturn.totalPrice = totalPrice;
      }

      await manager.save(PurchaseReturn, purchaseReturn);

      return manager.findOne(PurchaseReturn, {
        where: { id: purchaseReturn.id },
        relations: ['supplier', 'details', 'details.product'],
      }) as Promise<PurchaseReturn>;
    });
  }

  async updateStatus(
    dto: UpdatePurchaseReturnStatusRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseReturn> {
    const purchaseReturn = await this.findOne(dto.id);
    purchaseReturn.status = dto.status;
    if (dto.status === InvoiceStatus.CANCELLED) {
      purchaseReturn.isCancel = true;
    }
    purchaseReturn.updatedBy = currentUserId;
    return this.purchaseReturnRepository.save(purchaseReturn);
  }

  async cancel(
    id: number,
    currentUserId: number | null = null,
  ): Promise<PurchaseReturn> {
    const purchaseReturn = await this.findOne(id);
    if (purchaseReturn.isCancel) return purchaseReturn;

    return await this.dataSource.transaction(async (manager) => {
      purchaseReturn.isCancel = true;
      purchaseReturn.status = InvoiceStatus.CANCELLED;
      purchaseReturn.updatedBy = currentUserId;

      // Reverse stock (STOCK IN — undo the original OUT to supplier)
      for (const detail of purchaseReturn.details) {
        await this.stockService.adjustStock(
          manager,
          detail.productId,
          detail.quantity,
          'IN',
          `Cancelled - Purchase Return: ${purchaseReturn.code}`,
          currentUserId,
        );
      }

      await manager.save(PurchaseReturn, purchaseReturn);
      return purchaseReturn;
    });
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    let purchaseReturn = await this.findOne(id);
    if (!purchaseReturn.isCancel) {
      purchaseReturn = await this.cancel(id, currentUserId);
    }
    purchaseReturn.deletedBy = currentUserId;
    await this.purchaseReturnRepository.save(purchaseReturn);
    await this.purchaseReturnRepository.softRemove(purchaseReturn);
  }

  async forceDelete(id: number): Promise<void> {
    const purchaseReturn = await this.findOne(id);
    if (!purchaseReturn.isCancel) {
      await this.cancel(id, null);
    }
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(PurchaseReturnDetail, { purchaseReturnId: id });
      await manager.delete(PurchaseReturn, id);
    });
  }
}
