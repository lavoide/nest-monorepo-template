import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';

import type { TestingModule } from '@nestjs/testing';

describe('FilesService', () => {
  let service: FilesService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    file: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        AWS_REGION: 'us-east-1',
        AWS_ACCESS: 'test-access-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret-key',
        AWS_PUBLIC_BUCKET_NAME: 'test-public-bucket',
        AWS_PRIVATE_BUCKET_NAME: 'test-private-bucket',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all files', async () => {
      const expectedFiles = [
        {
          id: 'file-1',
          fileName: 'test1.pdf',
          mimeType: 'application/pdf',
          filePath: '/uploads/test1.pdf',
          url: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'file-2',
          fileName: 'test2.jpg',
          mimeType: 'image/jpeg',
          filePath: null,
          url: 'https://s3.amazonaws.com/test-bucket/test2.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.file.findMany.mockResolvedValue(expectedFiles);

      const result = await service.findAll();

      expect(result).toEqual(expectedFiles);
      expect(mockPrismaService.file.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a file when found', async () => {
      const expectedFile = {
        id: 'file-id-123',
        fileName: 'document.pdf',
        mimeType: 'application/pdf',
        filePath: '/uploads/document.pdf',
        url: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.file.findUnique.mockResolvedValue(expectedFile);

      const result = await service.findOne({ id: 'file-id-123' });

      expect(result).toEqual(expectedFile);
      expect(mockPrismaService.file.findUnique).toHaveBeenCalledWith({
        where: { id: 'file-id-123' },
      });
    });

    it('should throw HttpException when file not found', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(null);

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

  describe('remove', () => {
    it('should delete a file from local storage', async () => {
      const fileToDelete = {
        id: 'file-id-123',
        fileName: 'document.pdf',
        mimeType: 'application/pdf',
        filePath: '/uploads/document.pdf',
        url: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.file.findUnique.mockResolvedValue(fileToDelete);
      mockPrismaService.file.delete.mockResolvedValue(fileToDelete);

      // Mock fs.unlinkSync
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined);

      await service.remove({ id: 'file-id-123' });
      expect(mockPrismaService.file.delete).toHaveBeenCalledWith({
        where: { id: 'file-id-123' },
      });
    });

    it('should throw error when file not found', async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(null);

      await expect(service.remove({ id: 'non-existent-id' })).rejects.toThrow(
        HttpException,
      );
    });
  });
});
