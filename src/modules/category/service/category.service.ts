import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoryRepository } from '@/category/repository/category.repository';
import { CreateCategoryRequest, UpdateCategoryRequest, UpdateCategoryStatusRequest } from '@/category/dto';
import { PaginationRequest, PaginationMeta } from '@/common/dto';
import { Category } from '@/category/entity/category.entity';
import { generateCode, slugify } from '@/common/util/helper';
import { CloudinaryService } from '@/cloudinary/service/cloudinary.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    dto: CreateCategoryRequest,
    currentUserId: number | null = null,
  ): Promise<Category> {
    const existingName = await this.categoryRepository.findByName(dto.name);
    if (existingName) {
      throw new ConflictException(
        `Category with name "${dto.name}" already exists`,
      );
    }

    const existingCode = await this.categoryRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictException(
        `Category with code "${dto.code}" already exists`,
      );
    }

    const category = this.categoryRepository.create({
      ...dto,
      code: dto.code ?? generateCode('CAT'),
      slug: dto.slug ?? slugify(dto.name),
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });
    return this.categoryRepository.save(category);
  }

  async findAllWithPagination(
    pagination: PaginationRequest,
  ): Promise<[Category[], PaginationMeta]> {
    const { page, limit, sortBy, sortOrder } = pagination;
    const [data, total] = await this.categoryRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder } as any,
    });
    const meta = new PaginationMeta(page, limit, total, sortBy, sortOrder);
    return [data, meta];
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(
    dto: UpdateCategoryRequest,
    currentUserId: number | null = null,
  ): Promise<Category> {
    const category = await this.findOne(dto.id);
    if (dto.name && dto.name !== category.name) {
      if (await this.categoryRepository.findByName(dto.name)) {
        throw new ConflictException(
          `Category with name "${dto.name}" already exists`,
        );
      }
      if (!dto.slug) {
        dto.slug = slugify(dto.name);
      }
    }

    if (dto.code && dto.code !== category.code) {
      if (await this.categoryRepository.findByCode(dto.code)) {
        throw new ConflictException(
          `Category with code "${dto.code}" already exists`,
        );
      }
    }

    Object.assign(category, dto);
    category.updatedBy = currentUserId;

    return this.categoryRepository.save(category);
  }

  async updateStatus(
    dto: UpdateCategoryStatusRequest,
    currentUserId: number | null = null,
  ): Promise<Category> {
    const category = await this.findOne(dto.id);
    category.status = dto.status;
    category.updatedBy = currentUserId;
    return this.categoryRepository.save(category);
  }

  async softDelete(
    id: number,
    currentUserId: number | null = null,
  ): Promise<void> {
    const category = await this.findOne(id);
    category.deletedBy = currentUserId;
    await this.categoryRepository.save(category);
    await this.categoryRepository.softRemove(category);
  }

  async forceDelete(id: number): Promise<void> {
    const category = await this.findOne(id);

    // Delete image from Cloudinary if it exists
    if (category.imageUrl) {
      try {
        const parts = category.imageUrl.split('/');
        const filenameWithExtension = parts.pop();
        const publicId = filenameWithExtension?.split('.')[0];
        const fullPublicId = `pos-uploads/${publicId}`; // Folder is hardcoded for now or we could store it
        
        await this.cloudinaryService.deleteImage(fullPublicId);
      } catch (error) {
        console.error('Failed to delete Category image from Cloudinary:', error);
      }
    }

    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
  }
}
