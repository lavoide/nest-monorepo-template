import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { JwtAuthGuard } from '../../auth/jwt/jwtAuth.guard';
import { EntityQueryDto } from './dto/entity-query.dto';
import { ApiTags } from '@nestjs/swagger';
import RoleGuard from '../../auth/role/role.guard';
import { Role } from '@monorepo/shared';
import { BaseController } from '../../common/base.controller';

@Controller('helpers')
@ApiTags('Helpers')
export class HelpersController extends BaseController {
  constructor(private readonly helpersService: HelpersService) {
    super();
  }

  @Get('/paginated/')
  @UseGuards(RoleGuard([Role.Admin]))
  @UseGuards(JwtAuthGuard)
  async getPaginated(@Query() query: EntityQueryDto) {
    const result = await this.helpersService.getEntitiesPaginated(
      query?.entity,
      query?.where ? JSON.parse(query?.where) : {},
      Number(query?.page),
      query?.sortBy,
      query?.sortOrder,
      query?.filterBy,
      query?.filterContains,
    );
    return this.respondSuccess(result);
  }

  @Get('/entities/')
  @UseGuards(RoleGuard([Role.Admin]))
  @UseGuards(JwtAuthGuard)
  async getEntities() {
    const entities = await this.helpersService.getAvailableEntities();
    return this.respondSuccess(entities);
  }
}
