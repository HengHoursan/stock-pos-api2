import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';

@Entity('categories')
export class Category extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ default: true })
  status: boolean;
}
