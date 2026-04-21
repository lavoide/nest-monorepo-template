import type { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const JWT_PUBLIC = {
  EXPIRE_TIME: '5m',
  REFRESH_EXPIRE_TIME: '10d',
};

export const AUTH_INFO = {
  FORGOT_PASSWORD: 'Check your email inbox',
  RESET_PASSWORD: 'Password was updated successfully',
};

export const DOCUMENT_BUILDER_CONFIG_JWT: SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  name: 'JWT',
  description: 'Enter JWT token',
  in: 'header',
};
