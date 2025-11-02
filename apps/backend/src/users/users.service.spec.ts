import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { UsersService } from './users.service';
import { FilesService } from '../files/files.service';
import { PrismaService } from '../prisma/prisma.service';

import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { TestingModule } from '@nestjs/testing';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let filesService: FilesService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockFilesService = {
    uploadFile: jest.fn(),
    uploadFilePublic: jest.fn(),
    deleteFile: jest.fn(),
    deleteFilePublic: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    filesService = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword123',
      };

      const expectedUser = {
        id: 'user-id-123',
        ...createUserDto,
        role: 'USER',
        refreshToken: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User 1',
          password: 'hashed1',
          role: 'USER',
          refreshToken: null,
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User 2',
          password: 'hashed2',
          role: 'ADMIN',
          refreshToken: null,
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedUsers);

      const result = await service.findAll({
        skip: 0,
        take: 10,
      });

      expect(result).toEqual(expectedUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        cursor: undefined,
        where: undefined,
        orderBy: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const expectedUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: 'USER',
        refreshToken: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findOne({ id: 'user-id-123' });

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
      });
    });

    it('should throw HttpException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

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
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const existingUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: 'USER',
        refreshToken: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedUser = {
        ...existingUser,
        name: 'Updated Name',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(expectedUser);

      const result = await service.update({
        where: { id: 'user-id-123' },
        data: updateUserDto,
      });

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        data: updateUserDto,
        where: { id: 'user-id-123' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const existingUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: 'USER',
        refreshToken: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.delete.mockResolvedValue(existingUser);

      await service.remove({ id: 'user-id-123' });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-id-123' },
      });
    });
  });
});
