import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    default: 'string@test.com',
  })
  @IsEmail()
  @MinLength(6)
  @MaxLength(50)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  password: string;
}

export class SocialRegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    default: 'string@test.com',
  })
  @IsEmail()
  @MinLength(6)
  @MaxLength(50)
  email: string;
}
