import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateActivityDto } from './create-activity.dto';
import { Gender } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsJSON,
  IsEnum,
} from 'class-validator';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  typeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsJSON()
  weekdays?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  date?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAnyDate?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timeFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timeTo?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  filterGender?: Gender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  filterAgeFrom?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  filterAgeTo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  filterLocation?: number;
}
