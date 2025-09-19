import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApiOkResponseDto } from './dto/api-ok-response.dto';

@Injectable()
export class BaseController {
  protected respondSuccess(data: any = null, message: string = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  protected respondOk(message: string = 'Success'): ApiOkResponseDto {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  protected respondError(
    message: string = 'Error',
    code: number = HttpStatus.BAD_REQUEST,
  ): never {
    throw new HttpException(
      {
        success: false,
        message,
        timestamp: new Date().toISOString(),
      },
      code,
    );
  }

  protected respondNotFound(message: string = 'Not Found'): never {
    return this.respondError(message, HttpStatus.NOT_FOUND);
  }

  protected respondUnauthorized(message: string = 'Unauthorized'): never {
    return this.respondError(message, HttpStatus.UNAUTHORIZED);
  }

  protected respondForbidden(message: string = 'Forbidden'): never {
    return this.respondError(message, HttpStatus.FORBIDDEN);
  }

  protected respondCreated(data: any = null) {
    return this.respondSuccess(data, 'Created');
  }

  protected respondValidationError(
    message: string = 'Validation Error',
  ): never {
    return this.respondError(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }

  protected sendNoContent(): null {
    return null;
  }
}