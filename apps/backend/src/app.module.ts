import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EntitiesModule } from './entity/entities.module';
import { FilesModule } from './files/files.module';
import { HelpersModule } from './shared/helpers/helpers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', '..', '..', 'frontend', 'dist'),
        serveRoot: '/app',
        exclude: ['/api/(.*)'],
      },
      {
        rootPath: join(__dirname, '..', '..', '..', 'website', 'dist'),
        exclude: ['/api/(.*)', '/app/(.*)', '/swagger/(.*)'],
      },
    ),
    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    EntitiesModule,
    FilesModule,
    HelpersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
