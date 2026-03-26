import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';

@Entity('brands')
export class Brand extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ name: 'image_url', length: 255, nullable: true })
  imageUrl: string;

  @Column({ default: true })
  status: boolean;
}
