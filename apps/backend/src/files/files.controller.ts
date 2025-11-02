import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Header,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Request,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { join } from 'path';

import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt/jwtAuth.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import { BaseController } from '../common/base.controller';

@Controller('files')
@ApiTags('Files')
export class FilesController extends BaseController {
  constructor(private readonly filesService: FilesService) {
    super();
  }

  @Get('static-file')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="package.json"')
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.filesService.create(file);
    return this.respondCreated(result);
  }

  @Post('upload-aws')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPublicFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.filesService.createPublic(file);
    return this.respondCreated(result);
  }

  @Post('upload-aws-private')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPrivateFile(
    @Request() request: RequestWithUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.filesService.createPrivate(file, request.user.id);
    return this.respondCreated(result);
  }

  @Get('get-all-files')
  async findAll() {
    const files = await this.filesService.findAll();
    return this.respondSuccess(files);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const file = await this.filesService.findOne({ id });
    if (!file) {
      this.respondNotFound(`File with ID ${id} not found`);
    }
    return this.respondSuccess(file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.filesService.remove({ id });
    return this.respondOk('File deleted successfully');
  }

  @Delete('/public/:id')
  async removePublic(@Param('id') id: string) {
    await this.filesService.removePublic({ id });
    return this.respondOk('Public file deleted successfully');
  }
}
