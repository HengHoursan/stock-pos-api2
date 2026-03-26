import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/user/service/user.service';
import { JwtService } from '@/jwt/service/jwt.service';
import { TokenBlacklistService } from '@/token_blacklist/service/token_blacklist.service';
import { LoginRequest, RegisterRequest } from '@/auth/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async register(dto: RegisterRequest) {
    const user = await this.userService.create(dto);
    return this.jwtService.generateTokens(user.id, user.email);
  }

  async login(dto: LoginRequest) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return this.jwtService.generateTokens(user.id, user.email);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      const user = await this.userService.findOne(payload.sub);
      return this.jwtService.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    const accessPayload = this.jwtService.decodeToken(accessToken);
    const accessExp = new Date((accessPayload.exp as number) * 1000);
    await this.tokenBlacklistService.revoke(accessToken, accessExp);

    if (refreshToken) {
      try {
        const refreshPayload = this.jwtService.verifyRefreshToken(refreshToken);
        const refreshExp = new Date((refreshPayload.exp as number) * 1000);
        await this.tokenBlacklistService.revoke(refreshToken, refreshExp);
      } catch {
        // refresh token invalid/expired — ignore, access token already revoked
      }
    }
  }
}
