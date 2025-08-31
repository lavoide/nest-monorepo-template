import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SocialAuthDto } from './dto/auth.dto';
import { RegisterDto, SocialRegisterDto } from './dto/register.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './local/localAuth.guard';
import { JwtAuthGuard } from './jwt/jwtAuth.guard';
import RequestWithUser from './requestWithUser.interface';
import { Response } from 'express';
import JwtRefreshGuard from './jwt/jwtRefresh.guard';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';

@Controller('auth')
@ApiBearerAuth('JWT-auth')
@ApiTags('Authorization')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(@Body() signInDto: AuthDto, @Res() response: Response) {
    const tokens = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    await this.authService.setCurrentRefreshToken(
      tokens.refresh_token,
      signInDto.email,
    );
    return response.send(tokens);
  }

  @HttpCode(HttpStatus.OK)
  @Post('social-login')
  async signInSocial(
    @Body() signInDto: SocialAuthDto,
    @Res() response: Response,
  ) {
    const tokens = await this.authService.signInSocial(signInDto.token);
    return response.send(tokens);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('social-register')
  registerSocial(@Body() registerDto: SocialRegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logOut(@Request() request: RequestWithUser, @Res() response: Response) {
    await this.authService.removeRefreshToken(request.user.email);
    return response.sendStatus(200);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Request() request: RequestWithUser,
    @Body('refreshToken') refreshToken: string,
  ) {
    const accessToken = await this.authService.refreshLogin(refreshToken);
    return accessToken;
  }
}
