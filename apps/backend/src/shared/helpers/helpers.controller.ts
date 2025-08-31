import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HelpersService } from './helpers.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwtAuth.guard';
import { EntityQueryDto } from './dto/entity-query.dto';
import { ApiTags } from '@nestjs/swagger';
import RoleGuard from 'src/auth/role/role.guard';
import { Role } from '@monorepo/shared';

@Controller('helpers')
@ApiTags('Helpers')
export class HelpersController {
  constructor(private readonly helpersService: HelpersService) {}

  @Get('/paginated/')
  @UseGuards(RoleGuard([Role.Admin]))
  @UseGuards(JwtAuthGuard)
  getPaginated(
    @Query() query: EntityQueryDto,
  ): Promise<{ data: any[]; pagination: any }> {
    return this.helpersService.getEntitiesPaginated(
      query?.entity,
      query?.where ? JSON.parse(query?.where) : {},
      Number(query?.page),
      query?.sortBy,
      query?.sortOrder,
      query?.filterBy,
      query?.filterContains,
    );
  }

  @Get('/entities/')
  @UseGuards(RoleGuard([Role.Admin]))
  @UseGuards(JwtAuthGuard)
  getEntities(): Promise<Array<string>> {
    return this.helpersService.getAvailableEntities();
  }
}
