import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('EntitiesController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let testUserId: string;
  let testEntityId: string;
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
      email: 'entity-user-e2e-test@example.com',
      name: 'Entity User E2E Test',
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
      email: 'entity-admin-e2e-test@example.com',
      name: 'Entity Admin E2E Test',
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
      await prismaService.entity
        .deleteMany({
          where: { userId: testUserId },
        })
        .catch(() => undefined);
      await prismaService.user
        .delete({
          where: { id: testUserId },
        })
        .catch(() => undefined);
    }
    if (adminUserId) {
      await prismaService.entity
        .deleteMany({
          where: { userId: adminUserId },
        })
        .catch(() => undefined);
      await prismaService.user
        .delete({
          where: { id: adminUserId },
        })
        .catch(() => undefined);
    }
    await app.close();
  });

  describe('/api/entities (POST)', () => {
    it('should create a new entity with authentication', async () => {
      const createEntityDto = {
        name: 'Test Entity',
        description: 'This is a test entity',
        status: 'active',
        userId: testUserId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/entities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEntityDto)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(createEntityDto.name);
      expect(response.body.data.description).toBe(createEntityDto.description);
      expect(response.body.data.status).toBe(createEntityDto.status);

      testEntityId = response.body.data.id;
    });

    it('should not create entity without authentication', async () => {
      const createEntityDto = {
        name: 'Test Entity',
        description: 'This is a test entity',
        status: 'active',
        userId: testUserId,
      };

      await request(app.getHttpServer())
        .post('/api/entities')
        .send(createEntityDto)
        .expect(401);
    });

    it('should not create entity with invalid data', async () => {
      const createEntityDto = {
        description: 'Missing name field',
        userId: testUserId,
      };

      await request(app.getHttpServer())
        .post('/api/entities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEntityDto)
        .expect(400);
    });
  });

  describe('/api/entities (GET)', () => {
    it('should get list of all entities', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/entities')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('/api/entities/:id (GET)', () => {
    it('should get entity by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/entities/${testEntityId}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testEntityId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 404 for non-existent entity', async () => {
      await request(app.getHttpServer())
        .get('/api/entities/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('/api/entities/by-user-id/:userId (GET)', () => {
    it('should get entities by user id with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/entities/by-user-id/${testUserId}`)
        .query({ page: 1 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should support filtering by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/entities/by-user-id/${testUserId}`)
        .query({
          page: 1,
          filterBy: 'status',
          filterContains: 'active',
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('data');
    });

    it('should support sorting', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/entities/by-user-id/${testUserId}`)
        .query({
          page: 1,
          sortBy: 'name',
          sortOrder: 'asc',
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('data');
    });
  });

  describe('/api/entities/:id (PATCH)', () => {
    it('should update own entity', async () => {
      const updateDto = {
        name: 'Updated Entity Name',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/entities/${testEntityId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(updateDto.name);
      expect(response.body.data.description).toBe(updateDto.description);
    });

    it('admin should be able to update any entity', async () => {
      const updateDto = {
        name: 'Admin Updated Entity',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/entities/${testEntityId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe(updateDto.name);
    });

    it('should update status field', async () => {
      const updateDto = {
        status: 'inactive',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/entities/${testEntityId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.status).toBe(updateDto.status);
    });
  });

  describe('/api/entities/:id (DELETE)', () => {
    let deleteTestEntityId: string;

    beforeEach(async () => {
      // Create an entity to delete
      const createEntityDto = {
        name: 'Entity to Delete',
        description: 'This entity will be deleted',
        status: 'active',
        userId: testUserId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/entities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEntityDto);

      deleteTestEntityId = response.body.data.id;
    });

    it('should not delete without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/entities/${deleteTestEntityId}`)
        .expect(401);

      // Verify entity still exists
      const entity = await prismaService.entity.findUnique({
        where: { id: deleteTestEntityId },
      });
      expect(entity).toBeTruthy();
    });

    it('should delete own entity with authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/entities/${deleteTestEntityId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify entity is deleted
      const entity = await prismaService.entity.findUnique({
        where: { id: deleteTestEntityId },
      });
      expect(entity).toBeNull();
    });

    it('admin should be able to delete any entity', async () => {
      // Create entity for admin to delete
      const createEntityDto = {
        name: 'Entity for Admin to Delete',
        status: 'active',
        userId: testUserId,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/entities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createEntityDto);

      const entityToDeleteId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .delete(`/api/entities/${entityToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify entity is deleted
      const entity = await prismaService.entity.findUnique({
        where: { id: entityToDeleteId },
      });
      expect(entity).toBeNull();
    });
  });
});
