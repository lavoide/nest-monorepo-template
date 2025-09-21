import { ApiProperty } from '@nestjs/swagger';

export class ApiOkResponseDto {
  @ApiProperty()
  success: true;

  @ApiProperty()
  message: string;

  @ApiProperty()
  timestamp: string;
}
