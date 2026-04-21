import { Module } from '@nestjs/common';
import { HelpersModule } from '../shared/helpers/helpers.module';
import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';

@Module({
  imports: [HelpersModule],
  controllers: [EntitiesController],
  providers: [EntitiesService],
})
export class EntitiesModule {}
