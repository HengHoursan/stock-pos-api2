import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: {
    sub: number;
    email: string;
  }): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.configService.get<string>('jwt.access_token.secret'),
      expiresIn: this.configService.get<string>(
        'jwt.access_token.expiresIn',
      ) as any,
    };
    return this.jwtService.signAsync(payload, options);
  }

  async generateRefreshToken(payload: {
    sub: number;
    email: string;
  }): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.configService.get<string>('jwt.refresh_token.secret'),
      expiresIn: this.configService.get<string>(
        'jwt.refresh_token.expiresIn',
      ) as any,
    };
    return this.jwtService.signAsync(payload, options);
  }

  async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('jwt.refresh_token.secret'),
    });
  }

  decodeToken(token: string): Record<string, unknown> {
    return this.jwtService.decode(token) as Record<string, unknown>;
  }
}
