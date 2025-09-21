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

    testUserId = userRegisterResponse.body.id;

    const userLoginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: userRegisterDto.email,
        password: userRegisterDto.password,
      });

    accessToken = userLoginResponse.body.access_token;

    // Create an admin test user
    const adminRegisterDto = {
      email: 'admin-e2e-test@example.com',
      name: 'Admin E2E Test',
      password: 'AdminPassword123!',
    };

    const adminRegisterResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(adminRegisterDto);

    adminUserId = adminRegisterResponse.body.id;

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

    adminToken = adminLoginResponse.body.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await prismaService.user.delete({
        where: { id: testUserId },
      }).catch(() => {});
    }
    if (adminUserId) {
      await prismaService.user.delete({
        where: { id: adminUserId },
      }).catch(() => {});
    }
    await app.close();
  });

  describe('/api/users (GET)', () => {
    it('should get list of users with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should not get users without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });
  });

  describe('/api/users/:id (GET)', () => {
    it('should get user by id with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should not get user without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/api/users/${testUserId}`)
        .expect(401);
    });
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

      expect(response.body.name).toBe(updateDto.name);
    });

    it('should not update other user profile as regular user', async () => {
      const updateDto = {
        name: 'Hacked Name',
      };

      await request(app.getHttpServer())
        .patch(`/api/users/${adminUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(403);
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

      expect(response.body.name).toBe(updateDto.name);
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

      deleteTestUserId = response.body.id;
    });

    it('regular user should not delete other users', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${deleteTestUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

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

    it('admin should be able to delete users', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${deleteTestUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify user is deleted
      const user = await prismaService.user.findUnique({
        where: { id: deleteTestUserId },
      });
      expect(user).toBeNull();
    });

    it('should not delete without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/users/${deleteTestUserId}`)
        .expect(401);

      // Clean up
      await prismaService.user.delete({
        where: { id: deleteTestUserId },
      }).catch(() => {});
    });
  });

  describe('/api/users (POST)', () => {
    it('admin should create a new user', async () => {
      const createUserDto = {
        email: 'created-by-admin@example.com',
        name: 'Created by Admin',
        password: 'CreatedPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(createUserDto.email.toLowerCase());
      expect(response.body.name).toBe(createUserDto.name);

      // Clean up
      await prismaService.user.delete({
        where: { id: response.body.id },
      });
    });

    it('regular user should not create users', async () => {
      const createUserDto = {
        email: 'unauthorized-create@example.com',
        name: 'Unauthorized Create',
        password: 'UnauthorizedPassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createUserDto)
        .expect(403);
    });
  });
});