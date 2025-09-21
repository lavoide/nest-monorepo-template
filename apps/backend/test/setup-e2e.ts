import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

beforeAll(async () => {
  // Ensure test database is properly set up
  console.log('Setting up test database...');

  try {
    // Push the schema to the test database
    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      cwd: path.join(__dirname, '..'),
    });
    console.log('Test database schema pushed successfully');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

afterAll(async () => {
  // Clean up test data
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.error('Failed to clean up test database:', error);
    }
  }

  await prisma.$disconnect();
});
