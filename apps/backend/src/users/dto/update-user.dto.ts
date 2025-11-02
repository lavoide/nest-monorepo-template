import { Role } from '@monorepo/shared';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

import { UserDto } from './user-dto';

export class UpdateUserDto extends PartialType(UserDto) {
  @ApiProperty()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @ApiProperty()
  @IsEmail()
  @MinLength(6)
  @MaxLength(50)
  email?: string;

  @ApiProperty()
  @MinLength(3)
  @MaxLength(50)
  password?: string;

  @ApiProperty()
  refreshToken?: string;

  @ApiProperty()
  role?: Role;
}
