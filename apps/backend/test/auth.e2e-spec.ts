import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    prismaService = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    if (process.env.NODE_ENV === 'test') {
      await prismaService.user.deleteMany({
        where: {
          email: {
            contains: 'test',
          },
        },
      });
    }
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test-e2e@example.com',
        name: 'Test E2E User',
        password: 'TestPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(registerDto.email.toLowerCase());
      expect(response.body.name).toBe(registerDto.name);
      expect(response.body).not.toHaveProperty('password');

      // Clean up
      await prismaService.user.delete({
        where: { id: response.body.id },
      });
    });

    it('should not register user with invalid email', async () => {
      const registerDto = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'TestPassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should not register user with weak password', async () => {
      const registerDto = {
        email: 'test2@example.com',
        name: 'Test User',
        password: '123',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);
    });

    it('should not register duplicate user', async () => {
      const registerDto = {
        email: 'duplicate-test@example.com',
        name: 'Duplicate Test User',
        password: 'TestPassword123!',
      };

      // First registration should succeed
      const firstResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      // Second registration with same email should fail
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);

      // Clean up
      await prismaService.user.delete({
        where: { id: firstResponse.body.id },
      });
    });
  });

  describe('/api/auth/login (POST)', () => {
    let testUserId: string;

    beforeAll(async () => {
      // Create a test user for login tests
      const registerDto = {
        email: 'login-test@example.com',
        name: 'Login Test User',
        password: 'LoginPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto);

      testUserId = response.body.id;
    });

    afterAll(async () => {
      // Clean up test user
      if (testUserId) {
        await prismaService.user.delete({
          where: { id: testUserId },
        });
      }
    });

    it('should login with valid credentials', async () => {
      const loginDto = {
        email: 'login-test@example.com',
        password: 'LoginPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginDto.email.toLowerCase());
    });

    it('should not login with invalid password', async () => {
      const loginDto = {
        email: 'login-test@example.com',
        password: 'WrongPassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should not login with non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(404);
    });
  });

  describe('/api/auth/profile (GET)', () => {
    let accessToken: string;
    let testUserId: string;

    beforeAll(async () => {
      // Create and login a test user
      const registerDto = {
        email: 'profile-test@example.com',
        name: 'Profile Test User',
        password: 'ProfilePassword123!',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto);

      testUserId = registerResponse.body.id;

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        });

      accessToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
      // Clean up test user
      if (testUserId) {
        await prismaService.user.delete({
          where: { id: testUserId },
        });
      }
    });

    it('should get profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name');
      expect(response.body.email).toBe('profile-test@example.com');
    });

    it('should not get profile without token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should not get profile with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    let refreshToken: string;
    let testUserId: string;

    beforeAll(async () => {
      // Create and login a test user
      const registerDto = {
        email: 'refresh-test@example.com',
        name: 'Refresh Test User',
        password: 'RefreshPassword123!',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto);

      testUserId = registerResponse.body.id;

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        });

      refreshToken = loginResponse.body.refresh_token;
    });

    afterAll(async () => {
      // Clean up test user
      if (testUserId) {
        await prismaService.user.delete({
          where: { id: testUserId },
        });
      }
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
    });

    it('should not refresh with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);
    });
  });
});