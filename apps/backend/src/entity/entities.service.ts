import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Entity, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { ENTITY_ERRORS } from './entities.constants';
import { AUTH_ERRORS } from '../auth/auth.constants';
import { Role } from '@monorepo/shared';

@Injectable()
export class EntitiesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEntityDto): Promise<Entity> {
    return this.prisma.entity.create({
      data,
    });
  }

  async findAll(): Promise<Entity[]> {
    return this.prisma.entity.findMany();
  }

  async findOne(
    entityWhereUniqueInput: Prisma.EntityWhereUniqueInput,
  ): Promise<Entity | null> {
    const entity = await this.prisma.entity.findUnique({
      where: entityWhereUniqueInput,
    });
    if (entity) {
      return entity;
    }
    throw new HttpException(ENTITY_ERRORS.NOT_FOUND, HttpStatus.NOT_FOUND);
  }

  async update(
    user: User,
    id: string,
    data: UpdateEntityDto,
  ): Promise<Entity> {
    const entity = await this.findOne({ id });
    if (user.role === Role.ADMIN || entity.userId === user.id) {
      return this.prisma.entity.update({
        where: { id },
        data,
      });
    } else {
      throw new UnauthorizedException(AUTH_ERRORS.CANT_DELETE);
    }
  }

  async remove(role: Role, id: string, userId: string): Promise<void> {
    const entity = await this.findOne({ id });
    if (role === Role.ADMIN || entity.userId === userId) {
      await this.prisma.entity.delete({
        where: { id },
      });
    } else {
      throw new UnauthorizedException(AUTH_ERRORS.CANT_DELETE);
    }
  }
}
