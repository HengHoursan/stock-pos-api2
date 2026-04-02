import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { Category } from '../../category/entity/category.entity';
import { Brand } from '../../brand/entity/brand.entity';
import { Unit } from '../../unit/entity/unit.entity';
import { ProductDetail } from './product_detail.entity';

@Entity('products')
export class Product extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column()
  name: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'brand_id', nullable: true })
  brandId: number;

  @Column({ name: 'unit_id' })
  unitId: number;

  @Column({ name: 'alert_quantity', type: 'decimal', precision: 12, scale: 2, default: 0 })
  alertQuantity: number;

  @Column({ name: 'sku_code', nullable: true, unique: true })
  skuCode: string;

  @Column({ name: 'barcode_type', nullable: true })
  barcodeType: string;

  @Column({ name: 'photo_path', nullable: true })
  photoPath: string;

  @Column({ default: true })
  status: boolean;

  @Column({ name: 'for_selling', default: true })
  forSelling: boolean;

  @Column({ name: 'is_manufacture', default: false })
  isManufacture: boolean;

  @Column({ name: 'manage_stock', default: true })
  manageStock: boolean;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @OneToOne(() => ProductDetail, (detail) => detail.product)
  detail: ProductDetail;
}
