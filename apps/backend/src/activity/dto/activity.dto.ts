import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Expose } from 'class-transformer';

export class ActivityDto {
  @Expose()
  @ApiProperty()
  type: string;

  @Expose()
  @ApiProperty({ required: false })
  weekdays?: JSON;

  @Expose()
  @ApiProperty({ required: false })
  date?: Date;

  @Expose()
  @ApiProperty({ required: false })
  isAnyDate?: boolean;

  @Expose()
  @ApiProperty()
  timeFrom: string;

  @Expose()
  @ApiProperty()
  timeTo: string;

  @Expose()
  @ApiProperty({ enum: Gender, default: Gender.ANY })
  filterGender: Gender;

  @Expose()
  @ApiProperty({ required: false })
  filterAgeFrom?: number;

  @Expose()
  @ApiProperty({ required: false })
  filterAgeTo?: number;

  @Expose()
  @ApiProperty({ required: false })
  filterLocation?: string;

  @Expose()
  @ApiProperty()
  author: string;
}
