import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user-dto';
import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

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
