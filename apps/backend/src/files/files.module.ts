import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService, PrismaService, ConfigService],
  exports: [FilesService],
})
export class FilesModule {}
