import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorsConstants } from '../constants/errors-constants';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionsFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ErrorsConstants.internalServerErrorMessage;
    let errorCode = 'DATABASE_ERROR';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // Unique constraint violation
          status = HttpStatus.CONFLICT;
          message = `A record with this ${exception.meta?.target?.[0] || 'field'} already exists`;
          errorCode = 'UNIQUE_CONSTRAINT_VIOLATION';
          break;
        case 'P2003': // Foreign key constraint violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Referenced record does not exist';
          errorCode = 'FOREIGN_KEY_VIOLATION';
          break;
        case 'P2025': // Record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          errorCode = 'RECORD_NOT_FOUND';
          break;
        case 'P2014': // Invalid ID
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid ID provided';
          errorCode = 'INVALID_ID';
          break;
        case 'P2011': // Null constraint violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Required field is missing';
          errorCode = 'NULL_CONSTRAINT_VIOLATION';
          break;
        case 'P2012': // Missing required field
          status = HttpStatus.BAD_REQUEST;
          message = 'Missing required field';
          errorCode = 'MISSING_REQUIRED_FIELD';
          break;
        case 'P2013': // Missing required argument
          status = HttpStatus.BAD_REQUEST;
          message = 'Missing required argument';
          errorCode = 'MISSING_REQUIRED_ARGUMENT';
          break;
        case 'P2015': // Related record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Related record not found';
          errorCode = 'RELATED_RECORD_NOT_FOUND';
          break;
        case 'P2016': // Query interpretation error
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid query parameters';
          errorCode = 'INVALID_QUERY';
          break;
        case 'P2017': // Records not connected
          status = HttpStatus.BAD_REQUEST;
          message = 'Records are not connected';
          errorCode = 'RECORDS_NOT_CONNECTED';
          break;
        case 'P2018': // Required connected records not found
          status = HttpStatus.NOT_FOUND;
          message = 'Required connected records not found';
          errorCode = 'REQUIRED_CONNECTED_RECORDS_NOT_FOUND';
          break;
        case 'P2019': // Input error
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid input data';
          errorCode = 'INVALID_INPUT';
          break;
        case 'P2020': // Value out of range
          status = HttpStatus.BAD_REQUEST;
          message = 'Value out of range';
          errorCode = 'VALUE_OUT_OF_RANGE';
          break;
        case 'P2021': // Table does not exist
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database table does not exist';
          errorCode = 'TABLE_NOT_FOUND';
          break;
        case 'P2022': // Column does not exist
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database column does not exist';
          errorCode = 'COLUMN_NOT_FOUND';
          break;
        case 'P2023': // Inconsistent column data
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Inconsistent column data';
          errorCode = 'INCONSISTENT_COLUMN_DATA';
          break;
        case 'P2024': // Connection timeout
          status = HttpStatus.REQUEST_TIMEOUT;
          message = 'Database connection timeout';
          errorCode = 'CONNECTION_TIMEOUT';
          break;
        case 'P2026': // Query engine version mismatch
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database version mismatch';
          errorCode = 'VERSION_MISMATCH';
          break;
        case 'P2027': // Multiple errors occurred
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Multiple database errors occurred';
          errorCode = 'MULTIPLE_ERRORS';
          break;
        case 'P2030': // Fulltext index not found
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Fulltext index not found';
          errorCode = 'FULLTEXT_INDEX_NOT_FOUND';
          break;
        case 'P2031': // MongoDB replica set not initialized
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database replica set not initialized';
          errorCode = 'REPLICA_SET_NOT_INITIALIZED';
          break;
        case 'P2033': // Integer overflow
          status = HttpStatus.BAD_REQUEST;
          message = 'Integer overflow';
          errorCode = 'INTEGER_OVERFLOW';
          break;
        case 'P2034': // Transaction failed
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database transaction failed';
          errorCode = 'TRANSACTION_FAILED';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = `Database error: ${exception.message}`;
          errorCode = `DATABASE_ERROR_${exception.code}`;
      }
    }

    // Use standardized error response format
    response.status(status).json({
      success: false,
      message,
      error_code: errorCode,
      prisma_code: exception.code,
      meta: exception.meta,
      timestamp: new Date().toISOString(),
    });
  }
}
