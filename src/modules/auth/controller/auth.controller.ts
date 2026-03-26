import { Controller, Post, Body, Req, Headers } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '@/common/security/decorator/public.decorator';
import { AuthService } from '@/auth/service/auth.service';
import { LoginRequest, RegisterRequest, RefreshTokenRequest, LoginResponse, RegisterResponse, RefreshTokenResponse } from '@/auth/dto';
import { ApiResponse } from '@/common/dto';

@Controller('authentications')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterRequest) {
    const tokens = await this.authService.register(dto);
    return ApiResponse.success<RegisterResponse>(tokens, 'Registration successful');
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginRequest) {
    const tokens = await this.authService.login(dto);
    return ApiResponse.success<LoginResponse>(tokens, 'Login successful');
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenRequest) {
    const tokens = await this.authService.refreshTokens(dto.refreshToken);
    return ApiResponse.success<RefreshTokenResponse>(tokens, 'Tokens refreshed successfully');
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Body('refreshToken') refreshToken?: string,
  ) {
    const authHeader = req.headers['authorization'] ?? '';
    const accessToken = authHeader.replace('Bearer ', '');
    await this.authService.logout(accessToken, refreshToken);
    return ApiResponse.success(null, 'Logged out successfully');
  }
}
