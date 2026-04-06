import { Entity, Column, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '../../../common/entity/base.entity';
import { PurchaseQuotationDetail } from './purchase_quotation_detail.entity';

@Entity('purchase_quotations')
export class PurchaseQuotation extends SoftDeleteEntity {
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ name: 'quotation_date', type: 'timestamp' })
  quotationDate: Date;

  @Column({ name: 'total_line', type: 'int', default: 0 })
  totalLine: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => PurchaseQuotationDetail, (detail) => detail.purchaseQuotation, { cascade: true })
  details: PurchaseQuotationDetail[];
}
