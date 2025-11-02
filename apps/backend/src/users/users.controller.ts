import { Role } from '@monorepo/shared';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt/jwtAuth.guard';
import RequestWithUser from '../auth/requestWithUser.interface';
import RoleGuard from '../auth/role/role.guard';
import { BaseController } from '../common/base.controller';

@Controller('users')
@ApiTags('Users')
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.respondCreated(user);
  }

  @Get()
  @UseGuards(RoleGuard([Role.ADMIN]))
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const users = await this.usersService.findAll({});
    return this.respondSuccess(users);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne({ id });
    if (!user) {
      this.respondNotFound(`User with ID ${id} not found`);
    }
    return this.respondSuccess(user);
  }

  @Patch('/add-file-private')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addFilePrivate(
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
    await this.usersService.addFilePrivate(request.user.id, file);
    return this.respondOk('File uploaded successfully');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update({
      where: { id },
      data: updateUserDto,
    });
    return this.respondSuccess(user, 'User updated successfully');
  }

  @Patch('/add-avatar-locally/:id')
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
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
  ) {
    const user = await this.usersService.addAvatar({
      where: { id },
      data: file,
    });
    return this.respondSuccess(user, 'Avatar updated successfully');
  }

  @Patch('/add-avatar-public/:id')
  @UseInterceptors(FileInterceptor('file'))
  async addAvatarPublic(
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
  ) {
    const user = await this.usersService.addAvatarPublic({
      where: { id },
      data: file,
    });
    return this.respondSuccess(user, 'Public avatar updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.usersService.remove({ id });
    return this.respondOk('User deleted successfully');
  }

  @Post('/remove-avatar-public/:id')
  async removePublicAvatar(@Param('id') id: string) {
    const user = await this.usersService.removeAvatarPublic({ id });
    return this.respondSuccess(user, 'Avatar removed successfully');
  }
}
