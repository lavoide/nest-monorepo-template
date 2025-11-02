import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthDto, SocialAuthDto } from './dto/auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { RegisterDto, SocialRegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt/jwtAuth.guard';
import JwtRefreshGuard from './jwt/jwtRefresh.guard';
import { LocalAuthGuard } from './local/localAuth.guard';
import RequestWithUser from './requestWithUser.interface';
import { BaseController } from '../common/base.controller';

@Controller('auth')
@ApiBearerAuth('JWT-auth')
@ApiTags('Authorization')
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async signIn(@Body() signInDto: AuthDto) {
    const tokens = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    await this.authService.setCurrentRefreshToken(
      tokens.refresh_token,
      signInDto.email,
    );
    return this.respondSuccess(tokens, 'Login successful');
  }

  @HttpCode(HttpStatus.OK)
  @Post('social-login')
  async signInSocial(@Body() signInDto: SocialAuthDto) {
    const tokens = await this.authService.signInSocial(signInDto.token);
    return this.respondSuccess(tokens, 'Social login successful');
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return this.respondCreated(user);
  }

  @Post('social-register')
  async registerSocial(@Body() registerDto: SocialRegisterDto) {
    const user = await this.authService.register(registerDto);
    return this.respondCreated(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return this.respondOk('Password reset email sent');
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
    return this.respondOk('Password reset successful');
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return this.respondSuccess(req.user);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logOut(@Request() request: RequestWithUser) {
    await this.authService.removeRefreshToken(request.user.email);
    return this.respondOk('Logout successful');
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Request() request: RequestWithUser) {
    const accessToken = await this.authService.refreshLogin(request.user);
    return this.respondSuccess(accessToken, 'Token refreshed');
  }
}
