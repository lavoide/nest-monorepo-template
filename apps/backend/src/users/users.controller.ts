import {
  Controller,
  Get,
  Request,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import RoleGuard from '../auth/role/role.guard';
import { Role } from 'src/shared/enums/role.enum';
import { JwtAuthGuard } from '../auth/jwt/jwtAuth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import RequestWithUser from 'src/auth/requestWithUser.interface';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RoleGuard([Role.Admin]))
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<User[]> {
    return this.usersService.findAll({});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne({ id });
  }

  @Patch('/add-file-private')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  addFilePrivate(
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
  ): Promise<void> {
    return this.usersService.addFilePrivate(request.user.id, file);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update({
      where: { id },
      data: updateUserDto,
    });
  }

  @Patch('/add-avatar-locally/:id')
  @UseInterceptors(FileInterceptor('file'))
  addAvatar(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<User> {
    return this.usersService.addAvatar({
      where: { id },
      data: file,
    });
  }

  @Patch('/add-avatar-public/:id')
  @UseInterceptors(FileInterceptor('file'))
  addAvatarPublic(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: /image\/(jpg|jpeg|png)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<User> {
    return this.usersService.addAvatarPublic({
      where: { id },
      data: file,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove({ id });
  }

  @Post('/remove-avatar-public/:id')
  removePublicAvatar(@Param('id') id: string): Promise<User> {
    return this.usersService.removeAvatarPublic({ id });
  }
}
