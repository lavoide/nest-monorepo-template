import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { PrismaService } from '../prisma.service';
import { HelpersService } from 'src/shared/helpers/helpers.service';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService, PrismaService, HelpersService],
})
export class ActivitiesModule {}
