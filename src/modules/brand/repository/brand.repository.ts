import { Injectable } from '@nestjs/common';
import { Brand } from '../entity/brand.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BrandRepository extends Repository<Brand> {
  constructor(private dataSource: DataSource) {
    super(Brand, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.findOne({ where: { name } });
  }

  async findByCode(code: string): Promise<Brand | null> {
    return this.findOne({ where: { code } });
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    return this.findOne({ where: { slug } });
  }

  async findByParentId(parentId: number): Promise<Brand | null> {
    return this.findOne({ where: { parentId } });
  }
}
