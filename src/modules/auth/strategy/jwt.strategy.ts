import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from '../../user/service/user.service';
import { TokenBlacklistService } from '../../token_blacklist/service/token_blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.access_token.secret')!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: number; email: string }) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) throw new UnauthorizedException();

    const blacklisted = await this.tokenBlacklistService.isBlacklisted(token);
    if (blacklisted) throw new UnauthorizedException('Your token has been revoked');

    const user = await this.userService.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException();

    const permissions =
      user.role?.rolePermissions?.map((rp) => rp.permission.name) || [];

    return {
      id: user.id,
      username: user.username,
      role: user.role?.name,
      permissions,
    };
  }
}
