import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    default: 'string@test.com',
  })
  @IsEmail()
  @MinLength(6)
  @MaxLength(50)
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  password: string;
}
