import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as quotedPrintable from 'quoted-printable';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const mailServiceMode = this.configService.get('MAIL_SERVICE_MODE');

    if (mailServiceMode === 'local') {
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    } else if (mailServiceMode === 'custom') {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: this.configService.get<number>('SMTP_PORT') === 465,
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });
    }
  }

  async sendResetPasswordEmail(to: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get('APP_NAME', 'YourAppName')}" <${this.configService.get('MAIL_FROM', 'noreply@yourapp.com')}>`,
      to,
      subject: 'Password Reset Request',
      html: `Click <a href="${resetLink}">here</a> to reset your password.`,
    };

    const info = await this.transporter.sendMail(mailOptions);

    if (this.configService.get('MAIL_SERVICE_MODE') === 'local') {
      console.log(
        'Local email content:',
        quotedPrintable.decode(info.message.toString()),
      );
    } else {
      console.log('Email sent: %s', info.messageId);
    }
  }
}
