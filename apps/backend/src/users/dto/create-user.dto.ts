import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
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
