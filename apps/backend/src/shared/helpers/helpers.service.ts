import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  HELPER_ERRORS,
  OrderDirectionConstants,
  PAGE_SIZE,
} from './helpers.contsants';

@Injectable()
export class HelpersService {
  constructor(private prisma: PrismaService) {}

  async getEntitiesPaginated(
    entity: string,
    where: any,
    page: number,
    sortBy: string,
    sortOrder: OrderDirectionConstants,
    filterBy: string,
    filterContains: string,
  ): Promise<{ data: any[]; pagination: any }> {
    // Check if the page number is valid, if not, set it to 1
    if (!page || page - 1 < 1) {
      page = 1;
    }
    // Check if the entity exists in the Prisma model
    const model = this.prisma[entity];

    if (!model) {
      throw new HttpException(
        HELPER_ERRORS.WRONG_ENTITY,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    // Get the fields of the model
    const entityFields = this.getModelFields(entity);

    const pageSize = PAGE_SIZE[entity.toUpperCase()] || PAGE_SIZE.DEFAULT;

    if (filterBy) {
      const isValidFilterProperty = entityFields.includes(filterBy);
      if (!isValidFilterProperty) {
        throw new HttpException(
          HELPER_ERRORS.WRONG_PARAM,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      where[`${filterBy}`] = { contains: filterContains };
    }
    const orderBy: any = {};
    if (sortBy) {
      const isValidSortProperty = entityFields.includes(sortBy);
      if (!isValidSortProperty) {
        throw new HttpException(
          HELPER_ERRORS.WRONG_PARAM,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      orderBy[`${sortBy}`] = sortOrder;
    }

    const data = await model.findMany({
      where: where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: orderBy,
    } as any);

    const total = await model.count({ where: where });

    return {
      data,
      pagination: {
        page,
        pageSize: pageSize,
        total,
        totalPages: Math.max(total / pageSize, 1),
      },
    };
  }

  getModelFields(entity: string) {
    // Construct the property name dynamically
    const propName = `${
      entity.charAt(0).toUpperCase() + entity.slice(1)
    }ScalarFieldEnum`;

    // Access the Prisma model type dynamically
    const modelType = Prisma[propName as keyof typeof Prisma];

    // Return the keys (fields) of the model type
    return Object.keys(modelType) as string[];
  }

  async getAvailableEntities() {
    // Extract model names based on the Prisma properties
    const entityKeys = Object.keys(Prisma).filter((key) =>
      key.endsWith('ScalarFieldEnum'),
    );
    // Convert to lowercase and remove  suffix
    return entityKeys.map(
      (key) =>
        key.charAt(0).toLowerCase() +
        key.replace('ScalarFieldEnum', '').slice(1),
    );
  }
}
