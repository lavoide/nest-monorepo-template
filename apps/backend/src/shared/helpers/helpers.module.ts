import { Module } from '@nestjs/common';

import { HelpersController } from './helpers.controller';
import { HelpersService } from './helpers.service';

@Module({
  controllers: [HelpersController],
  providers: [HelpersService],
  exports: [HelpersService],
})
export class HelpersModule {}
