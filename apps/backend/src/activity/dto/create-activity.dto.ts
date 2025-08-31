import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsJSON,
  IsEnum,
} from 'class-validator';

export class CreateActivityDto {
  @ApiProperty()
  @IsString()
  typeId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsJSON()
  weekdays?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  date?: Date;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isAnyDate?: boolean;

  @ApiProperty()
  @IsString()
  timeFrom: string;

  @ApiProperty()
  @IsString()
  timeTo: string;

  @ApiProperty({ enum: Gender, default: Gender.ANY })
  @IsEnum(Gender)
  filterGender: Gender;

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

  @ApiProperty()
  @IsString()
  userId: string;
}
