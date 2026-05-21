import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';

@Entity('activity_logs')
export class ActivityLog extends BaseEntity {
  @Column({ name: 'action', length: 50 })
  action: string;

  @Column({ name: 'entity_name', length: 100 })
  entityName: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 100, nullable: true })
  entityId: string;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  oldValues: any;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  newValues: any;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;
}
