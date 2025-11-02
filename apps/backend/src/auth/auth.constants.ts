import type { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const AUTH_ERRORS = {
  SOMETHING_WRONG: 'Something went wrong',
  WRONG_CREDS: 'Wrong credentials provided',
  INVALID_TOKEN: 'Invalid token',
  CANT_DELETE: 'You are not authorized to delete this record',
  CANT_EDIT: 'You are not authorized to edit this record',
  WRONG_GOOGLE_TOKEN: 'Invalid google token',
};

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
