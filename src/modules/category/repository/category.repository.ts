import { Injectable } from '@nestjs/common';
import { Category } from '../entity/category.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }
  async findByName(name: string): Promise<Category | null> {
    return this.findOne({ where: { name } });
  }
  async findByCode(code: string): Promise<Category | null> {
    return this.findOne({ where: { code } });
  }
  async findBySlug(slug: string): Promise<Category | null> {
    return this.findOne({ where: { slug } });
  }
  async findByParentId(parentId: number): Promise<Category | null> {
    return this.findOne({ where: { parentId } });
  }
}
