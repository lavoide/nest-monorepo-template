import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderDirectionConstants } from '../helpers.contsants';

export class EntityQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  entity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  where?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  page?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  sortBy?: string;

  @IsOptional()
  @IsEnum(Object.values(OrderDirectionConstants))
  @ApiProperty({
    type: String,
    required: false,
    enum: Object.values(OrderDirectionConstants),
  })
  sortOrder?: OrderDirectionConstants;

  @ApiProperty({ required: false })
  @IsOptional()
  filterBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  filterContains?: string;
}
