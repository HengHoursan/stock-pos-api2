import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PurchaseOrderRepository } from '../repository/purchase_order.repository';
import {
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  UpdatePurchaseOrderStatusRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { PurchaseOrder } from '../entity/purchase_order.entity';
import { PurchaseOrderDetail } from '../entity/purchase_order_detail.entity';
import { OrderStatus } from '@/common/enum/order_status.enum';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreatePurchaseOrderRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseOrder> {
    const code = dto.code?.trim() || generateCode('PORD');

    const existingCode = await this.purchaseOrderRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(`Purchase Order with code "${code}" already exists`);
    }

    return await this.dataSource.transaction(async (manager) => {
      const order = manager.create(PurchaseOrder, {
        code,
        supplierId: dto.supplierId,
        orderDate: DateConvertor(dto.orderDate) || new Date(),
        description: dto.description,
        status: OrderStatus.PENDING,
        isCancel: false,
        totalLine: dto.details?.length || 0,
        totalCloseLine: 0,
        totalPrice: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedOrder = await manager.save(PurchaseOrder, order);

      let totalPrice = 0;
      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(PurchaseOrderDetail, {
            purchaseOrderId: savedOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            purchaseQuotationId: item.purchaseQuotationId || null,
            purchaseQuotationDetailId: item.purchaseQuotationDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchaseOrderDetail, detail);
          totalPrice += Number(item.totalPrice);
        }
      }

      savedOrder.totalPrice = totalPrice;
      await manager.save(PurchaseOrder, savedOrder);

      return manager.findOne(PurchaseOrder, {
        where: { id: savedOrder.id },
        relations: ['supplier', 'details', 'details.product'],
      }) as Promise<PurchaseOrder>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[PurchaseOrder[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.purchaseOrderRepository.findAllWithPagination(pagination);
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find({
      relations: ['supplier', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['supplier', 'details', 'details.product'],
    });
    if (!order) {
      throw new NotFoundException(`Purchase Order with id ${id} not found`);
    }
    return order;
  }

  async update(
    dto: UpdatePurchaseOrderRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseOrder> {
    const order = await this.findOne(dto.id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot edit a purchase order that is not in PENDING status');
    }

    if (dto.code && dto.code !== order.code) {
      const existing = await this.purchaseOrderRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Purchase Order with code "${dto.code}" already exists`);
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) order.code = dto.code;
      if (dto.supplierId) order.supplierId = dto.supplierId;
      if (dto.orderDate) order.orderDate = DateConvertor(dto.orderDate) || order.orderDate;
      if (dto.description !== undefined) order.description = dto.description;
      order.updatedBy = currentUserId;

      if (dto.details) {
        await manager.delete(PurchaseOrderDetail, { purchaseOrderId: order.id });

        let totalPrice = 0;
        for (const item of dto.details) {
          const detail = manager.create(PurchaseOrderDetail, {
            purchaseOrderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            purchaseQuotationId: item.purchaseQuotationId || null,
            purchaseQuotationDetailId: item.purchaseQuotationDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(PurchaseOrderDetail, detail);
          totalPrice += Number(item.totalPrice);
        }

        order.totalLine = dto.details.length;
        order.totalPrice = totalPrice;
      }

      await manager.save(PurchaseOrder, order);

      return manager.findOne(PurchaseOrder, {
        where: { id: order.id },
        relations: ['supplier', 'details', 'details.product'],
      }) as Promise<PurchaseOrder>;
    });
  }

  async updateStatus(
    dto: UpdatePurchaseOrderStatusRequest,
    currentUserId: number | null = null,
  ): Promise<PurchaseOrder> {
    const order = await this.findOne(dto.id);
    order.status = dto.status;
    if (dto.status === OrderStatus.CANCELLED) {
      order.isCancel = true;
    }
    order.updatedBy = currentUserId;
    return this.purchaseOrderRepository.save(order);
  }

  async cancel(
    id: number,
    currentUserId: number | null = null,
  ): Promise<PurchaseOrder> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed purchase order');
    }
    order.isCancel = true;
    order.status = OrderStatus.CANCELLED;
    order.updatedBy = currentUserId;
    return this.purchaseOrderRepository.save(order);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const order = await this.findOne(id);
    order.deletedBy = currentUserId;
    await this.purchaseOrderRepository.save(order);
    await this.purchaseOrderRepository.softRemove(order);
  }

  async forceDelete(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(PurchaseOrderDetail, { purchaseOrderId: id });
      await manager.delete(PurchaseOrder, id);
    });
  }
}
