import { ERROR_KEYS } from '@monorepo/shared';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcryptjs';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private userService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      passReqToCallback: true,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate(request: Request, payload: any) {
    const refreshToken = request.body.refreshToken;
    const user = await this.userService.findOne({ email: payload.email });
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (isRefreshTokenMatching) {
      return {
        id: payload.id,
        name: user.name,
        email: payload.email,
        role: payload.role,
      };
    }
    throw new HttpException(
      ERROR_KEYS.AUTH.INVALID_TOKEN,
      HttpStatus.UNAUTHORIZED,
    );
  }
}
