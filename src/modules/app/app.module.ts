import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from './core.module';
import { SeedModule } from '../seed/seed.module';
import { SupplierModule } from '../supplier/supplier.module';
import { CustomerModule } from '../customer/customer.module';
import databaseConfig from '../../config/db.config';
import jwtConfig from '../../config/jwt.config';
import cloudinaryConfig from '../../config/cloudinary.config';
import { JwtAuthGuard } from '../../common/security/guard/jwt_auth.guard';
import { PermissionsGuard } from '../../common/security/guard/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, cloudinaryConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database')!,
    }),
    CoreModule,
    SeedModule,
    SupplierModule,
    CustomerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
