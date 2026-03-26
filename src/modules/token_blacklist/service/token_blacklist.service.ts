import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { TokenBlacklist } from '../entity/token_blacklist.entity';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(TokenBlacklist)
    private readonly repo: Repository<TokenBlacklist>,
  ) {}

  async revoke(token: string, expiresAt: Date): Promise<void> {
    const entry = this.repo.create({ token, expiresAt });
    await this.repo.save(entry);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const entry = await this.repo.findOne({ where: { token } });
    return !!entry;
  }

  /** Call periodically (e.g. cron) to keep the table small */
  async purgeExpired(): Promise<void> {
    await this.repo.delete({ expiresAt: LessThan(new Date()) });
  }
}
