import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { PermissionModule } from '../permission/permission.module';
import { RolePermissionModule } from '../role_permission/role_permission.module';
import { AuthModule } from '../auth/auth.module';
import { BrandModule } from '../brand/brand.module';
import { CategoryModule } from '../category/category.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { JwtModule } from '../jwt/jwt.module';
import { TokenBlacklistModule } from '../token_blacklist/token_blacklist.module';
import { UploadModule } from '../upload/upload.module';
import { UnitModule } from '../unit/unit.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    UserModule,
    RoleModule,
    PermissionModule,
    RolePermissionModule,
    AuthModule,
    BrandModule,
    CategoryModule,
    CloudinaryModule,
    JwtModule,
    TokenBlacklistModule,
    UploadModule,
    UnitModule,
    CurrencyModule,
  ],
  exports: [
    UserModule,
    RoleModule,
    PermissionModule,
    RolePermissionModule,
    AuthModule,
    BrandModule,
    CategoryModule,
    CloudinaryModule,
    JwtModule,
    TokenBlacklistModule,
    UploadModule,
    UnitModule,
    CurrencyModule,
  ],
})
export class CoreModule {}
