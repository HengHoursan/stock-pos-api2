import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenBlacklist } from './entity/token_blacklist.entity';
import { TokenBlacklistService } from './service/token_blacklist.service';

@Module({
  imports: [TypeOrmModule.forFeature([TokenBlacklist])],
  providers: [TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class TokenBlacklistModule {}
