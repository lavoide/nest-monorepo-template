import { Module } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { HelpersController } from './helpers.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [HelpersController],
  providers: [HelpersService, PrismaService],
})
export class HelpersModule {}
