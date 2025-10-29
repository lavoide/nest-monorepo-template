import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { OrderDirectionConstants } from '../../shared/helpers/helpers.contsants';

export class EntityQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
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
  @IsString()
  filterBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  filterContains?: string;
}
