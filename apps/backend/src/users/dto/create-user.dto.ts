import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

import { UserDto } from './user-dto';

export class CreateUserDto extends UserDto {
  @ApiProperty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty()
  @IsEmail()
  @MinLength(6)
  @MaxLength(50)
  email: string;

  @ApiProperty()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}
