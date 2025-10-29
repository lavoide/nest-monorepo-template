import { PrismaClient, Gender, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.entity.deleteMany({});
  await prisma.user.deleteMany({});
}

async function seedDatabase() {
  // Seed Users
  const users = [
    {
      email: 'john@example.com',
      name: 'John Doe',
      password: await bcrypt.hash('test123', 10),
      role: Role.USER,
    },
    {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: await bcrypt.hash('test123', 10),
      role: Role.USER,
    },
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: await bcrypt.hash('admin123', 10),
      role: Role.ADMIN,
    },
  ];

  await prisma.user.createMany({ data: users });
  const createdUsers = await prisma.user.findMany();

  // Seed Entities
  const entities = [
    {
      name: 'Sample Entity 1',
      description: 'This is a sample entity for demonstration',
      status: 'active',
      userId: createdUsers[0].id,
    },
    {
      name: 'Sample Entity 2',
      description: 'Another example entity',
      status: 'active',
      userId: createdUsers[0].id,
    },
    {
      name: 'Sample Entity 3',
      description: 'Third entity example',
      status: 'inactive',
      userId: createdUsers[1].id,
    },
    {
      name: 'Sample Entity 4',
      status: 'active',
      userId: createdUsers[0].id,
    },
  ];

  await prisma.entity.createMany({ data: entities });
  console.log('Database seeded successfully');
}

async function main() {
  try {
    await clearDatabase();
    await seedDatabase();
    console.log('Database cleared and seeded successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect from the Prisma client
    await prisma.$disconnect();
  }
}

main();
