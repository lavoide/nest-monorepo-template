import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderDirectionConstants } from '../helpers.contsants';

export class EntityQueryDto {
  @ApiProperty({ required: false })
  entity: string;

  @ApiProperty({ required: false })
  where?: string;

  @ApiProperty({ required: false })
  page?: string;

  @ApiProperty({ required: false })
  sortBy?: string;

  @IsEnum(Object.values(OrderDirectionConstants))
  @ApiProperty({
    type: String,
    required: false,
    enum: Object.values(OrderDirectionConstants),
  })
  sortOrder?: OrderDirectionConstants;

  @ApiProperty({ required: false })
  filterBy?: string;

  @ApiProperty({ required: false })
  filterContains?: string;
}
