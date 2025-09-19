import { Type } from '@nestjs/common';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export function ApiResponseDto<T>(DataDto: Type<T>) {
  class ApiResponseDtoClass {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Success' })
    message: string;

    @ApiProperty({ example: new Date().toISOString() })
    timestamp: string;

    @ApiProperty({
      description: 'Response data',
      oneOf: [{ $ref: getSchemaPath(DataDto) }],
    })
    data: T;
  }

  Object.defineProperty(ApiResponseDtoClass, 'name', {
    value: `ApiResponseDto_${DataDto.name}`,
  });

  return ApiResponseDtoClass;
}