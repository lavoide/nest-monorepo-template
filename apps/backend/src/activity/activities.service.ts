import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Activity, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ACTIVITY_ERRORS } from './activities.contsants';
import { AUTH_ERRORS } from '../auth/auth.constants';
import { Role } from '@monorepo/shared';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateActivityDto): Promise<Activity> {
    return this.prisma.activity.create({
      data,
    });
  }

  async findAll(): Promise<Activity[]> {
    return this.prisma.activity.findMany();
  }

  async findAllTypes(): Promise<{ name: string }[]> {
    return this.prisma.activityType.findMany();
  }

  async findOne(
    articleWhereUniqueInput: Prisma.ActivityWhereUniqueInput,
  ): Promise<Activity | null> {
    const article = await this.prisma.activity.findUnique({
      where: articleWhereUniqueInput,
    });
    if (article) {
      return article;
    }
    throw new HttpException(ACTIVITY_ERRORS.NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  async update(
    user: User,
    id: string,
    data: UpdateActivityDto,
  ): Promise<Activity> {
    const article = await this.findOne({ id });
    if (user.role === Role.ADMIN || article.userId === user.id) {
      return this.prisma.activity.update({
        where: { id },
        data,
      });
    } else {
    }
  }

  async remove(role: Role, id: string, userId: string): Promise<void> {
    const article = await this.findOne({ id });
    if (role === Role.ADMIN || article.userId === userId) {
      await this.prisma.activity.delete({
        where: { id },
      });
    } else {
      throw new UnauthorizedException(AUTH_ERRORS.CANT_DELETE);
    }
  }
}
