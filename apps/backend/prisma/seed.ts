import { PrismaClient, Gender, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.activity.deleteMany({});
  await prisma.activityType.deleteMany({});
  await prisma.user.deleteMany({});
}

async function seedDatabase() {
  // Seed ActivityTypes
  const activityTypes = [
    { name: 'Running' },
    { name: 'Cycling' },
    { name: 'Swimming' },
    { name: 'Yoga' },
    {
      name: 'Weight Training',
    },
  ];

  await prisma.activityType.createMany({ data: activityTypes });
  const createdTypes = await prisma.activityType.findMany();

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

  // Seed Activities
  const activities = [
    {
      typeId: createdTypes[0].id,
      date: new Date('2024-01-15'),
      timeFrom: '07:00',
      timeTo: '08:00',
      filterGender: Gender.ANY,
      userId: createdUsers[0].id,
    },
    {
      typeId: createdTypes[2].id,
      isAnyDate: true,
      timeFrom: '07:00',
      timeTo: '08:00',
      filterGender: Gender.ANY,
      userId: createdUsers[0].id,
    },
    {
      typeId: createdTypes[3].id,
      date: new Date('2024-01-15'),
      timeFrom: '18:00',
      timeTo: '19:00',
      filterGender: Gender.ANY,
      filterAgeFrom: 18,
      filterAgeTo: 65,
      filterLocation: 3,
      userId: createdUsers[1].id,
    },
    {
      typeId: createdTypes[1].id,
      weekdays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      timeFrom: '16:00',
      timeTo: '17:30',
      filterGender: Gender.ANY,
      userId: createdUsers[0].id,
    },
  ];

  await prisma.activity.createMany({ data: activities });
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
