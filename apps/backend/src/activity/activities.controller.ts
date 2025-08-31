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
import { HelpersService } from 'src/shared/helpers/helpers.service';
import { EntityQueryDto } from 'src/shared/helpers/dto/entity-query.dto';
import { Role } from '@monorepo/shared';

@Controller('activities')
@ApiTags('Activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private helpersService: HelpersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() request: RequestWithUser,
    @Body() createActivityDto: CreateActivityDto,
  ) {
    const data = createActivityDto;
    data.userId = request.user?.id;
    return this.activitiesService.create(data);
  }

  @Get()
  findAll(): Promise<Activity[]> {
    return this.activitiesService.findAll();
  }

  @Get('/types')
  findAllTypes(): Promise<{ name: string }[]> {
    return this.activitiesService.findAllTypes();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.findOne({ id });
  }

  @Get('/by-user-id/:userId')
  // @UseGuards(JwtAuthGuard)
  findByUserId(
    @Param('userId') userId: string,
    @Query() query: EntityQueryDto,
  ): Promise<{ data: Activity[]; pagination: any }> {
    return this.helpersService.getEntitiesPaginated(
      'activity',
      { userId },
      Number(query?.page),
      query?.sortBy,
      query?.sortOrder,
      query?.filterBy,
      query?.filterContains,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Request() request: RequestWithUser,
  ): Promise<Activity> {
    return this.activitiesService.update(request.user, id, updateActivityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Request() request: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.activitiesService.remove(
      request.user.role as Role,
      id,
      request.user.id,
    );
  }
}
