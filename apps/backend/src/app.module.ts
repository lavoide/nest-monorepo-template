import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ActivitiesModule } from './activity/activities.module';
import { FilesModule } from './files/files.module';
import { HelpersModule } from './shared/helpers/helpers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', '..', '..', 'frontend', 'dist'),
        serveRoot: '/app',
        exclude: ['/api/(.*)'],
      },
      {
        rootPath: join(__dirname, '..', '..', '..', '..', 'packages', 'website', 'dist'),
        exclude: ['/api/(.*)', '/app/(.*)', '/swagger/(.*)'],
      },
    ),
    UsersModule,
    AuthModule,
    ActivitiesModule,
    FilesModule,
    HelpersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
