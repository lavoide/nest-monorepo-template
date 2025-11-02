import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { EntitiesModule } from './entity/entities.module';
import { FilesModule } from './files/files.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { HelpersModule } from './shared/helpers/helpers.module';
import { UsersModule } from './users/users.module';

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
