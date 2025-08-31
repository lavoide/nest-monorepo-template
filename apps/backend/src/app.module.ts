import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ActivitiesModule } from './activity/activities.module';
import { FilesModule } from './files/files.module';
import { HelpersModule } from './shared/helpers/helpers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
