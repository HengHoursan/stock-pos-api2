import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserModule } from '../user/user.module';
import { JwtModule } from '../jwt/jwt.module';
import { TokenBlacklistModule } from '../token_blacklist/token_blacklist.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    JwtModule,
    TokenBlacklistModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
