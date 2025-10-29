import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Entity } from '@prisma/client';
import { EntitiesService } from './entities.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import RequestWithUser from '../auth/requestWithUser.interface';
import { JwtAuthGuard } from '../auth/jwt/jwtAuth.guard';
import { HelpersService } from '../shared/helpers/helpers.service';
import { EntityQueryDto } from '../shared/helpers/dto/entity-query.dto';
import { Role } from '@monorepo/shared';
import { BaseController } from '../common/base.controller';

@Controller('entities')
@ApiTags('Entities')
export class EntitiesController extends BaseController {
  constructor(
    private readonly entitiesService: EntitiesService,
    private helpersService: HelpersService,
  ) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() request: RequestWithUser,
    @Body() createEntityDto: CreateEntityDto,
  ) {
    const data = createEntityDto;
    data.userId = request.user?.id;
    const entity = await this.entitiesService.create(data);
    return this.respondCreated(entity);
  }

  @Get()
  async findAll() {
    const entities = await this.entitiesService.findAll();
    return this.respondSuccess(entities);
  }

  @Get('/by-user-id/:userId')
  // @UseGuards(JwtAuthGuard)
  async findByUserId(
    @Param('userId') userId: string,
    @Query() query: EntityQueryDto,
  ) {
    const result = await this.helpersService.getEntitiesPaginated(
      'entity',
      { userId },
      Number(query?.page),
      query?.sortBy,
      query?.sortOrder,
      query?.filterBy,
      query?.filterContains,
    );
    return this.respondSuccess(result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const entity = await this.entitiesService.findOne({ id });
    if (!entity) {
      this.respondNotFound(`Entity with ID ${id} not found`);
    }
    return this.respondSuccess(entity);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEntityDto: UpdateEntityDto,
    @Request() request: RequestWithUser,
  ) {
    const entity = await this.entitiesService.update(
      request.user,
      id,
      updateEntityDto,
    );
    return this.respondSuccess(entity, 'Entity updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() request: RequestWithUser, @Param('id') id: string) {
    await this.entitiesService.remove(
      request.user.role as Role,
      id,
      request.user.id,
    );
    return this.respondOk('Entity deleted successfully');
  }
}
