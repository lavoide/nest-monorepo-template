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
import { Activity } from '@prisma/client';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import RequestWithUser from '../auth/requestWithUser.interface';
import { JwtAuthGuard } from '../auth/jwt/jwtAuth.guard';
import { HelpersService } from '../shared/helpers/helpers.service';
import { EntityQueryDto } from '../shared/helpers/dto/entity-query.dto';
import { Role } from '@monorepo/shared';
import { BaseController } from '../common/base.controller';

@Controller('activities')
@ApiTags('Activities')
export class ActivitiesController extends BaseController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private helpersService: HelpersService,
  ) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() request: RequestWithUser,
    @Body() createActivityDto: CreateActivityDto,
  ) {
    const data = createActivityDto;
    data.userId = request.user?.id;
    const activity = await this.activitiesService.create(data);
    return this.respondCreated(activity);
  }

  @Get()
  async findAll() {
    const activities = await this.activitiesService.findAll();
    return this.respondSuccess(activities);
  }

  @Get('/types')
  async findAllTypes() {
    const types = await this.activitiesService.findAllTypes();
    return this.respondSuccess(types);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const activity = await this.activitiesService.findOne({ id });
    if (!activity) {
      this.respondNotFound(`Activity with ID ${id} not found`);
    }
    return this.respondSuccess(activity);
  }

  @Get('/by-user-id/:userId')
  // @UseGuards(JwtAuthGuard)
  async findByUserId(
    @Param('userId') userId: string,
    @Query() query: EntityQueryDto,
  ) {
    const result = await this.helpersService.getEntitiesPaginated(
      'activity',
      { userId },
      Number(query?.page),
      query?.sortBy,
      query?.sortOrder,
      query?.filterBy,
      query?.filterContains,
    );
    return this.respondSuccess(result);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Request() request: RequestWithUser,
  ) {
    const activity = await this.activitiesService.update(
      request.user,
      id,
      updateActivityDto,
    );
    return this.respondSuccess(activity, 'Activity updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() request: RequestWithUser, @Param('id') id: string) {
    await this.activitiesService.remove(
      request.user.role as Role,
      id,
      request.user.id,
    );
    return this.respondOk('Activity deleted successfully');
  }
}
