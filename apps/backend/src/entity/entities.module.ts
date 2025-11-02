import { Module } from '@nestjs/common';

import { EntitiesController } from './entities.controller';
import { EntitiesService } from './entities.service';
import { HelpersModule } from '../shared/helpers/helpers.module';

@Module({
  imports: [HelpersModule],
  controllers: [EntitiesController],
  providers: [EntitiesService],
})
export class EntitiesModule {}
