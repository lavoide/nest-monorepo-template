import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as quotedPrintable from 'quoted-printable';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const mailServiceMode = process.env.MAIL_SERVICE_MODE;

    if (mailServiceMode === 'local') {
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    } else if (mailServiceMode === 'custom') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: false, // Use true if the port is 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendResetPasswordEmail(to: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: '"YourAppName" <noreply@yourapp.com>',
      to,
      subject: 'Password Reset Request',
      html: `Click <a href="${resetLink}">here</a> to reset your password.`,
    };

    const info = await this.transporter.sendMail(mailOptions);

    if (process.env.MAIL_SERVICE_MODE === 'local') {
      console.log(
        'Local email content:',
        quotedPrintable.decode(info.message.toString()),
      );
    } else {
      console.log('Email sent: %s', info.messageId);
    }
  }
}
