import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let prismaService: PrismaService;
  let mailService: MailService;

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRE_TIME: '15m',
        JWT_REFRESH_EXPIRE_TIME: '7d',
        GOOGLE_CLIENT_ID: 'test-google-client-id',
      };
      return config[key];
    }),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockMailService = {
    sendResetPasswordEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in a user with valid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: 'USER',
        refreshToken: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTokens = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.access_token)
        .mockResolvedValueOnce(mockTokens.refresh_token);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.signIn('test@example.com', 'password123');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should throw error for invalid password', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: 'USER',
        refreshToken: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signIn('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      const mockCreatedUser = {
        id: 'new-user-id',
        email: registerDto.email.toLowerCase(),
        name: registerDto.name,
        password: 'hashedPassword',
        role: 'USER',
        refreshToken: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      // Return a new object that can be mutated
      mockUsersService.create.mockImplementation(() =>
        Promise.resolve({ ...mockCreatedUser }),
      );

      const result = await service.register(registerDto);

      expect(result).toEqual({ ...mockCreatedUser, password: undefined });
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: registerDto.email.toLowerCase(),
        name: registerDto.name,
        password: 'hashedPassword',
      });
    });

    it('should throw error if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };

      const existingUser = {
        id: 'existing-user-id',
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'hashedPassword',
        role: 'USER',
        refreshToken: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        HttpException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
        }),
      );
    });
  });

  describe('refreshLogin', () => {
    it('should refresh access token with valid user payload', async () => {
      const mockUserPayload = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      mockJwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshLogin(mockUserPayload);

      expect(result).toHaveProperty('access_token', 'new-access-token');
      expect(result.user).toEqual(mockUserPayload);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(mockUserPayload, {
        secret: 'test-secret',
        expiresIn: '15m',
      });
    });

    it('should handle user payload with undefined fields', async () => {
      const incompleteUserPayload = {
        id: undefined,
        email: undefined,
        name: undefined,
        role: undefined,
      };

      mockJwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshLogin(incompleteUserPayload);

      expect(result).toHaveProperty('access_token', 'new-access-token');
      expect(result.user).toEqual(incompleteUserPayload);
    });
  });
});
