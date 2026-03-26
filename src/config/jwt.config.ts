import { registerAs } from '@nestjs/config';


export default registerAs('jwt', () => ({
  access_token: {
    secret: process.env.JWT_ACCESS_SECRET || 'accessSecret',
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
  },
  refresh_token: {
    secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
}));
