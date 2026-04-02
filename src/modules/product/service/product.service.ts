import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductRepository } from '../repository/product.repository';
import { ProductDetailRepository } from '../repository/product-detail.repository';
import {
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusRequest,
} from '../dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { Product } from '../entity/product.entity';
import { ProductDetail } from '../entity/product_detail.entity';
import { generateCode, slugify, DateConvertor } from '@/common/util/helper';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productDetailRepository: ProductDetailRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateProductRequest,
    currentUserId: number | null = null,
  ): Promise<Product> {
    const existingName = await this.productRepository.findByName(dto.name);
    if (existingName) {
      throw new ConflictException(
        `Product with name "${dto.name}" already exists`,
      );
    }

    if (dto.code && dto.code.trim() !== '') {
      const existingCode = await this.productRepository.findByCode(dto.code);
      if (existingCode) {
        throw new ConflictException(
          `Product with code "${dto.code}" already exists`,
        );
      }
    }

    const code = dto.code?.trim() || generateCode('PROD');
    const skuCode = dto.skuCode?.trim() || generateCode('SKU');

    return await this.dataSource.transaction(async (manager) => {
      // 1. Create Product
      const product = manager.create(Product, {
        ...dto,
        code,
        skuCode,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      const savedProduct = await manager.save(Product, product);

      // 2. Create Product Detail
      const detail = manager.create(ProductDetail, {
        productId: savedProduct.id,
        currentStock: dto.currentStock || 0,
        stockNumber: dto.stockNumber,
        purchasePrice: dto.purchasePrice || 0,
        salePrice: dto.salePrice || 0,
        expiryDate: DateConvertor(dto.expiryDate || ''),
        expiryType: dto.expiryType,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });
      await manager.save(ProductDetail, detail);

      // Return product with detail
      return manager.findOne(Product, {
        where: { id: savedProduct.id },
        relations: ['detail', 'category', 'brand', 'unit'],
      }) as Promise<Product>;
    });
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Product[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] =
      await this.productRepository.findAllWithPagination(pagination);

    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['category', 'brand', 'unit', 'detail'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand', 'unit', 'detail'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(
    dto: UpdateProductRequest,
    currentUserId: number | null = null,
  ): Promise<Product> {
    const product = await this.findOne(dto.id);

    if (dto.name && dto.name !== product.name) {
      if (await this.productRepository.findByName(dto.name)) {
        throw new ConflictException(
          `Product with name "${dto.name}" already exists`,
        );
      }
    }

    if (dto.code && dto.code !== product.code) {
      if (await this.productRepository.findByCode(dto.code)) {
        throw new ConflictException(
          `Product with code "${dto.code}" already exists`,
        );
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      // Update Product
      Object.assign(product, dto);
      product.updatedBy = currentUserId;
      await manager.save(Product, product);

      // Update Detail if provided
      const detail = await manager.findOne(ProductDetail, {
        where: { productId: product.id },
      });

      if (detail) {
        if (dto.currentStock !== undefined)
          detail.currentStock = dto.currentStock;
        if (dto.stockNumber !== undefined) detail.stockNumber = dto.stockNumber;
        if (dto.purchasePrice !== undefined)
          detail.purchasePrice = dto.purchasePrice;
        if (dto.salePrice !== undefined) detail.salePrice = dto.salePrice;
        if (dto.expiryDate !== undefined)
          detail.expiryDate = DateConvertor(dto.expiryDate);
        if (dto.expiryType !== undefined) detail.expiryType = dto.expiryType;

        detail.updatedBy = currentUserId;
        await manager.save(ProductDetail, detail);
      }

      return manager.findOne(Product, {
        where: { id: product.id },
        relations: ['category', 'brand', 'unit', 'detail'],
      }) as Promise<Product>;
    });
  }

  async updateStatus(
    dto: UpdateProductStatusRequest,
    currentUserId: number | null = null,
  ): Promise<Product> {
    const product = await this.findOne(dto.id);
    product.status = dto.status;
    product.updatedBy = currentUserId;
    return this.productRepository.save(product);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const product = await this.findOne(id);
    product.deletedBy = currentUserId;
    await this.productRepository.save(product);
    await this.productRepository.softRemove(product);
  }

  async forceDelete(id: number): Promise<void> {
    const product = await this.findOne(id);

    // Also delete detail first (cascading normally handled by DB but being explicit)
    if (product.detail) {
      await this.productDetailRepository.delete(product.detail.id);
    }

    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }
}
