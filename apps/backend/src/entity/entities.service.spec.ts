import { Role } from '@monorepo/shared';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { EntitiesService } from './entities.service';
import { PrismaService } from '../prisma/prisma.service';

import type { CreateEntityDto } from './dto/create-entity.dto';
import type { UpdateEntityDto } from './dto/update-entity.dto';
import type { TestingModule } from '@nestjs/testing';

describe('EntitiesService', () => {
  let service: EntitiesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    entity: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: Role.USER,
    refreshToken: null,
    gender: 'ANY',
    avatarId: null,
    publicFileId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminUser = {
    ...mockUser,
    id: 'admin-id-123',
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitiesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EntitiesService>(EntitiesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new entity', async () => {
      const createEntityDto: CreateEntityDto = {
        name: 'Test Entity',
        description: 'Test description',
        status: 'active',
        userId: 'user-id-123',
      };

      const expectedEntity = {
        id: 'entity-id-123',
        ...createEntityDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.entity.create.mockResolvedValue(expectedEntity);

      const result = await service.create(createEntityDto);

      expect(result).toEqual(expectedEntity);
      expect(mockPrismaService.entity.create).toHaveBeenCalledWith({
        data: createEntityDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of entities', async () => {
      const expectedEntities = [
        {
          id: 'entity-1',
          name: 'Entity 1',
          description: 'Description 1',
          status: 'active',
          userId: 'user-id-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'entity-2',
          name: 'Entity 2',
          description: 'Description 2',
          status: 'inactive',
          userId: 'user-id-456',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.entity.findMany.mockResolvedValue(expectedEntities);

      const result = await service.findAll();

      expect(result).toEqual(expectedEntities);
      expect(mockPrismaService.entity.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an entity when found', async () => {
      const expectedEntity = {
        id: 'entity-id-123',
        name: 'Test Entity',
        description: 'Test description',
        status: 'active',
        userId: 'user-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.entity.findUnique.mockResolvedValue(expectedEntity);

      const result = await service.findOne({ id: 'entity-id-123' });

      expect(result).toEqual(expectedEntity);
      expect(mockPrismaService.entity.findUnique).toHaveBeenCalledWith({
        where: { id: 'entity-id-123' },
      });
    });

    it('should throw HttpException when entity not found', async () => {
      mockPrismaService.entity.findUnique.mockResolvedValue(null);

      await expect(service.findOne({ id: 'non-existent-id' })).rejects.toThrow(
        HttpException,
      );

      await expect(service.findOne({ id: 'non-existent-id' })).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.NOT_FOUND,
        }),
      );
    });
  });

  describe('update', () => {
    it('should update an entity when user is owner', async () => {
      const updateEntityDto: UpdateEntityDto = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const existingEntity = {
        id: 'entity-id-123',
        name: 'Test Entity',
        description: 'Test description',
        status: 'active',
        userId: 'user-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedEntity = {
        ...existingEntity,
        ...updateEntityDto,
      };

      mockPrismaService.entity.findUnique.mockResolvedValue(existingEntity);
      mockPrismaService.entity.update.mockResolvedValue(expectedEntity);

      const result = await service.update(
        mockUser as any,
        'entity-id-123',
        updateEntityDto,
      );

      expect(result).toEqual(expectedEntity);
      expect(mockPrismaService.entity.update).toHaveBeenCalledWith({
        where: { id: 'entity-id-123' },
        data: updateEntityDto,
      });
    });

    it('should update an entity when user is admin', async () => {
      const updateEntityDto: UpdateEntityDto = {
        name: 'Admin Updated Name',
      };

      const existingEntity = {
        id: 'entity-id-123',
        name: 'Test Entity',
        description: 'Test description',
        status: 'active',
        userId: 'user-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedEntity = {
        ...existingEntity,
        ...updateEntityDto,
      };

      mockPrismaService.entity.findUnique.mockResolvedValue(existingEntity);
      mockPrismaService.entity.update.mockResolvedValue(expectedEntity);

      const result = await service.update(
        mockAdminUser as any,
        'entity-id-123',
        updateEntityDto,
      );

      expect(result).toEqual(expectedEntity);
      expect(mockPrismaService.entity.update).toHaveBeenCalledWith({
        where: { id: 'entity-id-123' },
        data: updateEntityDto,
      });
    });

    it('should throw UnauthorizedException when user is not owner or admin', async () => {
      const updateEntityDto: UpdateEntityDto = {
        name: 'Updated Name',
      };

      const existingEntity = {
        id: 'entity-id-123',
        name: 'Test Entity',
        description: 'Test description',
        status: 'active',
        userId: 'different-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.entity.findUnique.mockResolvedValue(existingEntity);

      await expect(
        service.update(mockUser as any, 'entity-id-123', updateEntityDto),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete an entity when user is owner', async () => {
      const existingEntity = {
        id: 'entity-id-123',
        name: 'Test Entity',
        description: 'Test description',
        status: 'active',
        userId: 'user-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.entity.findUnique.mockResolvedValue(existingEntity);
      mockPrismaService.entity.delete.mockResolvedValue(existingEntity);

      await service.remove(Role.USER, 'entity-id-123', 'user-id-123');

      expect(mockPrismaService.entity.findUnique).toHaveBeenCalledWith({
        where: { id: 'entity-id-123' },
      });
      expect(mockPrismaService.entity.delete).toHaveBeenCalledWith({
        where: { id: 'entity-id-123' },
      });
    });

    it('should delete an entity when user is admin', async () => {
      const existingEntity = {
        id: 'entity-id-123',
        name: 'Test Entity',
        description: 'Test description',
        status: 'active',
        userId: 'different-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.entity.findUnique.mockResolvedValue(existingEntity);
      mockPrismaService.entity.delete.mockResolvedValue(existingEntity);

      await service.remove(Role.ADMIN, 'entity-id-123', 'admin-id-123');

      expect(mockPrismaService.entity.findUnique).toHaveBeenCalledWith({
        where: { id: 'entity-id-123' },
      });
      expect(mockPrismaService.entity.delete).toHaveBeenCalledWith({
        where: { id: 'entity-id-123' },
      });
    });

    it('should throw UnauthorizedException when user is not owner or admin', async () => {
      const existingEntity = {
        id: 'entity-id-123',
        name: 'Test Entity',
        description: 'Test description',
        status: 'active',
        userId: 'different-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.entity.findUnique.mockResolvedValue(existingEntity);

      await expect(
        service.remove(Role.USER, 'entity-id-123', 'user-id-123'),
      ).rejects.toThrow();
    });
  });
});
