import * as bcrypt from 'bcryptjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { RegisterDto, SocialRegisterDto } from './dto/register.dto';
import { AUTH_ERRORS, AUTH_INFO, JWT_PUBLIC } from './auth.constants';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private oauthClient: OAuth2Client;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {
    this.oauthClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
    );
  }

  public async signIn(email: string, password: string) {
    const lowerCasedEmail = email.toLowerCase();
    const user = await this.usersService.findOne({ email: lowerCasedEmail });
    await this.verifyPassword(password, user.password);
    const payload = { id: user.id, name: user.name, email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRE_TIME',
        '7d',
      ),
    });
    await this.setCurrentRefreshToken(refresh_token, email);
    return {
      access_token,
      refresh_token,
      user: payload,
    };
  }

  public async signInSocial(token: string) {
    const { name, email } = await this.verifyGoogleToken(token);
    const lowerCasedEmail = email.toLowerCase();
    let user = await this.prisma.user.findUnique({
      where: { email: lowerCasedEmail },
    });
    if (!user) {
      user = await this.register({ name, email });
    }
    const payload = { id: user.id, name: user.name, email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRE_TIME',
        '7d',
      ),
    });
    await this.setCurrentRefreshToken(refresh_token, email);
    return {
      access_token,
      refresh_token,
      user: payload,
    };
  }

  public async refreshLogin(user: any) {
    const newPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const access_token = await this.jwtService.signAsync(newPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRE_TIME', '15m'),
    });

    return {
      access_token,
      user: newPayload,
    };
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(AUTH_ERRORS.WRONG_CREDS, HttpStatus.BAD_REQUEST);
    }
  }

  private async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      return {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        name: payload.name,
        picture: payload.picture,
        googleId: payload.sub,
      };
    } catch (error) {
      throw new HttpException(
        AUTH_ERRORS.WRONG_GOOGLE_TOKEN,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async register(registrationData: RegisterDto | SocialRegisterDto) {
    let hashedPassword = null;
    if (registrationData.hasOwnProperty('password')) {
      hashedPassword = await bcrypt.hash(registrationData['password'], 10);
    } else {
      const randomPassword = bcrypt.genSaltSync(10);
      hashedPassword = await bcrypt.hash(randomPassword, 10);
    }

    registrationData.email = registrationData.email.toLowerCase();
    const isUserExist = await this.prisma.user.findUnique({
      where: { email: registrationData.email },
    });
    if (isUserExist) {
      throw new HttpException(
        AUTH_ERRORS.SOMETHING_WRONG,
        HttpStatus.BAD_REQUEST,
      );
    }
    const createdUser = await this.usersService.create({
      ...registrationData,
      password: hashedPassword,
    });
    createdUser.password = undefined;
    return createdUser;
  }

  public async setCurrentRefreshToken(refreshToken: string, email: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update({
      where: { email },
      data: { refreshToken: currentHashedRefreshToken },
    });
  }

  public async removeRefreshToken(email: string) {
    return this.usersService.update({
      where: { email },
      data: {
        refreshToken: null,
      },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findOne({ email });
    const token = await this.jwtService.signAsync(
      { email: user.email, sub: user.id },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRE_TIME', '15m'),
      },
    );
    const resetLink = `https://yourapp.com/reset-password?token=${token}`;
    await this.mailService.sendResetPasswordEmail(user.email, resetLink);
    return { message: AUTH_INFO.FORGOT_PASSWORD };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const { email } = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    const user = await this.usersService.findOne({ email });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update({
      where: { email: user.email },
      data: {
        password: hashedPassword,
      },
    });
    return { message: AUTH_INFO.RESET_PASSWORD };
  }
}
