import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { SaleOrderRepository } from '../repository/sale_order.repository';
import {
  CreateSaleOrderRequest,
  UpdateSaleOrderRequest,
  UpdateSaleOrderStatusRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { SaleOrder } from '../entity/sale_order.entity';
import { SaleOrderDetail } from '../entity/sale_order_detail.entity';
import { OrderStatus } from '@/common/enum/order_status.enum';
import { generateCode, DateConvertor } from '@/common/util/helper';

@Injectable()
export class SaleOrderService {
  constructor(
    private readonly saleOrderRepository: SaleOrderRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateSaleOrderRequest,
    currentUserId: number | null = null,
  ): Promise<SaleOrder> {
    const code = dto.code?.trim() || generateCode('SORD');

    const existingCode = await this.saleOrderRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(`Sale Order with code "${code}" already exists`);
    }

    return await this.dataSource.transaction(async (manager) => {
      const order = manager.create(SaleOrder, {
        code,
        customerId: dto.customerId,
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
      const savedOrder = await manager.save(SaleOrder, order);

      let totalPrice = 0;
      if (dto.details && dto.details.length > 0) {
        for (const item of dto.details) {
          const detail = manager.create(SaleOrderDetail, {
            saleOrderId: savedOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            purchaseQuotationId: item.purchaseQuotationId || null,
            purchaseQuotationDetailId: item.purchaseQuotationDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(SaleOrderDetail, detail);
          totalPrice += Number(item.totalPrice);
        }
      }

      savedOrder.totalPrice = totalPrice;
      await manager.save(SaleOrder, savedOrder);

      return manager.findOne(SaleOrder, {
        where: { id: savedOrder.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleOrder>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[SaleOrder[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.saleOrderRepository.findAllWithPagination(pagination);

    // Auto-heal pending orders found in the current page
    for (const order of data) {
      if (order.status !== OrderStatus.COMPLETED && !order.isCancel) {
        await this.saleOrderRepository.autoHealFulfillment(order);
      }
    }

    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<SaleOrder[]> {
    return this.saleOrderRepository.find({
      relations: ['customer', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SaleOrder> {
    const order = await this.saleOrderRepository.findOne({
      where: { id },
      relations: ['customer', 'details', 'details.product'],
    });
    if (!order) {
      throw new NotFoundException(`Sale Order with id ${id} not found`);
    }

    if (order.status !== OrderStatus.COMPLETED && !order.isCancel) {
      await this.saleOrderRepository.autoHealFulfillment(order);
    }

    // Mark items that are already invoiced
    const { SaleInvoiceDetail } = await import('../../sale_invoice/entity/sale_invoice_detail.entity.js');
    const linkedInvoiceDetails = await this.dataSource.manager.find(SaleInvoiceDetail, {
      where: { saleOrderDetailId: In(order.details.map(d => d.id)) }
    });
    
    const invoicedDetailIds = new Set(linkedInvoiceDetails.map(lid => lid.saleOrderDetailId));
    
    order.details = order.details.map(detail => ({
      ...detail,
      isInvoiced: invoicedDetailIds.has(detail.id)
    })) as any;

    return order;
  }

  async update(
    dto: UpdateSaleOrderRequest,
    currentUserId: number | null = null,
  ): Promise<SaleOrder> {
    const order = await this.findOne(dto.id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot edit a sale order that is not in PENDING status');
    }

    if (dto.code && dto.code !== order.code) {
      const existing = await this.saleOrderRepository.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Sale Order with code "${dto.code}" already exists`);
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.code) order.code = dto.code;
      if (dto.customerId) order.customerId = dto.customerId;
      if (dto.orderDate) order.orderDate = DateConvertor(dto.orderDate) || order.orderDate;
      if (dto.description !== undefined) order.description = dto.description;
      order.updatedBy = currentUserId;

      if (dto.details) {
        await manager.delete(SaleOrderDetail, { saleOrderId: order.id });

        let totalPrice = 0;
        for (const item of dto.details) {
          const detail = manager.create(SaleOrderDetail, {
            saleOrderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            purchaseQuotationId: item.purchaseQuotationId || null,
            purchaseQuotationDetailId: item.purchaseQuotationDetailId || null,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(SaleOrderDetail, detail);
          totalPrice += Number(item.totalPrice);
        }

        order.totalLine = dto.details.length;
        order.totalPrice = totalPrice;
      }

      await manager.save(SaleOrder, order);

      return manager.findOne(SaleOrder, {
        where: { id: order.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleOrder>;
    });
  }

  async updateStatus(
    dto: UpdateSaleOrderStatusRequest,
    currentUserId: number | null = null,
  ): Promise<SaleOrder> {
    const order = await this.findOne(dto.id);
    order.status = dto.status;
    if (dto.status === OrderStatus.CANCELLED) {
      order.isCancel = true;
    }
    order.updatedBy = currentUserId;
    return this.saleOrderRepository.save(order);
  }

  async cancel(
    id: number,
    currentUserId: number | null = null,
  ): Promise<SaleOrder> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed sale order');
    }
    order.isCancel = true;
    order.status = OrderStatus.CANCELLED;
    order.updatedBy = currentUserId;
    return this.saleOrderRepository.save(order);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const order = await this.findOne(id);
    order.deletedBy = currentUserId;
    await this.saleOrderRepository.save(order);
    await this.saleOrderRepository.softRemove(order);
  }

  async forceDelete(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(SaleOrderDetail, { saleOrderId: id });
      await manager.delete(SaleOrder, id);
    });
  }

  async duplicate(
    id: number,
    currentUserId: number | null = null,
  ): Promise<SaleOrder> {
    const source = await this.findOne(id);
    const code = generateCode('SORD');

    return await this.dataSource.transaction(async (manager) => {
      const order = manager.create(SaleOrder, {
        ...source,
        id: undefined,
        code,
        orderDate: new Date(),
        status: OrderStatus.PENDING,
        isCancel: false,
        totalCloseLine: 0,
        createdBy: currentUserId,
        updatedBy: currentUserId,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined,
        details: undefined,
      });
      const savedOrder = await manager.save(SaleOrder, order);

      if (source.details && source.details.length > 0) {
        for (const item of source.details) {
          const detail = manager.create(SaleOrderDetail, {
            ...item,
            id: undefined,
            saleOrderId: savedOrder.id,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          });
          await manager.save(SaleOrderDetail, detail);
        }
      }

      return manager.findOne(SaleOrder, {
        where: { id: savedOrder.id },
        relations: ['customer', 'details', 'details.product'],
      }) as Promise<SaleOrder>;
    });
  }

  async bulkUpdateStatus(
    ids: number[],
    status: OrderStatus,
    currentUserId: number | null = null,
  ): Promise<void> {
    const isCancel = status === OrderStatus.CANCELLED;
    await this.saleOrderRepository.update(ids, {
      status,
      isCancel,
      updatedBy: currentUserId,
    });
  }

  async bulkSoftDelete(
    ids: number[],
    currentUserId: number | null = null,
  ): Promise<void> {
    const orders = await this.saleOrderRepository.createQueryBuilder('o')
      .where('o.id IN (:...ids)', { ids })
      .getMany();

    for (const order of orders) {
      order.deletedBy = currentUserId;
      await this.saleOrderRepository.save(order);
    }
    await this.saleOrderRepository.softRemove(orders);
  }
}
