import {
  Controller,
  Get,
  Request,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  StreamableFile,
  Header,
  UseGuards,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt/jwtAuth.guard';
import RequestWithUser from 'src/auth/requestWithUser.interface';
import { ApiTags } from '@nestjs/swagger';

@Controller('files')
@ApiTags('Files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('static-file')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="package.json"')
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
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
    return this.filesService.create(file);
  }

  @Post('upload-aws')
  @UseInterceptors(FileInterceptor('file'))
  uploadPublicFile(
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
    return this.filesService.createPublic(file);
  }

  @Post('upload-aws-private')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadPrivateFile(
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
    return this.filesService.createPrivate(file, request.user.id);
  }

  @Get('get-all-files')
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne({ id });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove({ id });
  }

  @Delete('/public/:id')
  removePublic(@Param('id') id: string) {
    return this.filesService.removePublic({ id });
  }
}
