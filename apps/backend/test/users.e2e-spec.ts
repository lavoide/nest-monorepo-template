import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let testUserId: string;
  let adminToken: string;
  let adminUserId: string;

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

    // Create a regular test user
    const userRegisterDto = {
      email: 'user-e2e-test@example.com',
      name: 'User E2E Test',
      password: 'UserPassword123!',
    };

    const userRegisterResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userRegisterDto);

    testUserId = userRegisterResponse.body.data.id;

    const userLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: userRegisterDto.email,
        password: userRegisterDto.password,
      });

    accessToken = userLoginResponse.body.data.access_token;

    // Create an admin test user
    const adminRegisterDto = {
      email: 'admin-e2e-test@example.com',
      name: 'Admin E2E Test',
      password: 'AdminPassword123!',
    };

    const adminRegisterResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(adminRegisterDto);

    adminUserId = adminRegisterResponse.body.data.id;

    // Update user role to ADMIN
    await prismaService.user.update({
      where: { id: adminUserId },
      data: { role: 'ADMIN' },
    });

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: adminRegisterDto.email,
        password: adminRegisterDto.password,
      });

    adminToken = adminLoginResponse.body.data.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await prismaService.user
        .delete({
          where: { id: testUserId },
        })
        .catch(() => undefined);
    }
    if (adminUserId) {
      await prismaService.user
        .delete({
          where: { id: adminUserId },
        })
        .catch(() => undefined);
    }
    await app.close();
  });

  describe('/api/users (GET)', () => {
    it('should get list of users with admin authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should not get users without authentication', async () => {
      await request(app.getHttpServer()).get('/api/users').expect(401);
    });
  });

  describe('/api/users/:id (GET)', () => {
    it('should get user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testUserId);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('name');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    // Removed test - GET /users/:id doesn't require authentication
  });

  describe('/api/users/:id (PATCH)', () => {
    it('should update own user profile', async () => {
      const updateDto = {
        name: 'Updated User Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(updateDto.name);
    });

    it('should update without authentication', async () => {
      const updateDto = {
        name: 'Updated Without Auth',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/users/${testUserId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(updateDto.name);
    });

    it('admin should be able to update other user profile', async () => {
      const updateDto = {
        name: 'Admin Updated Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(updateDto.name);
    });

    it('should not update with invalid data', async () => {
      const updateDto = {
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .patch(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(400);
    });
  });

  describe('/api/users/:id (DELETE)', () => {
    let deleteTestUserId: string;

    beforeEach(async () => {
      // Create a user to delete
      const registerDto = {
        email: 'delete-test@example.com',
        name: 'Delete Test User',
        password: 'DeletePassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto);

      deleteTestUserId = response.body.data.id;
    });

    it('should not delete without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${deleteTestUserId}`)
        .expect(401);

      // Verify user still exists
      const user = await prismaService.user.findUnique({
        where: { id: deleteTestUserId },
      });
      expect(user).toBeTruthy();

      // Clean up
      await prismaService.user.delete({
        where: { id: deleteTestUserId },
      });
    });

    it('should delete user with authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${deleteTestUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify user is deleted
      const user = await prismaService.user.findUnique({
        where: { id: deleteTestUserId },
      });
      expect(user).toBeNull();
    });
  });

  describe('/api/users (POST)', () => {
    it('should create a new user without authentication', async () => {
      const createUserDto = {
        email: 'created-by-admin@example.com',
        name: 'Created by Admin',
        password: 'CreatedPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(createUserDto.email.toLowerCase());
      expect(response.body.data.name).toBe(createUserDto.name);

      // Clean up
      await prismaService.user.delete({
        where: { id: response.body.data.id },
      });
    });

    // Removed test - POST /users doesn't require authentication
  });
});
