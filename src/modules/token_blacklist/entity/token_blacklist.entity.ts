import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('token_blacklist')
export class TokenBlacklist {
  @PrimaryColumn({ type: 'text' })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'revoked_at', type: 'timestamp' })
  revokedAt: Date;
}
