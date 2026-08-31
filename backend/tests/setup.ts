// Test environment configuration.
// Must be imported BEFORE the app or prisma client to ensure the test
// database URL is used by dotenv/config and the Prisma client.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/amanda_cafe_test';

import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';

// Clean the database by deleting rows in foreign-key-safe order,
// preserving the structure so tests start from a known, empty state.
export const resetDb = async (): Promise<void> => {
  await prisma.$transaction([
    prisma.stockMovement.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.order.deleteMany(),
    prisma.diningTable.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.user.deleteMany(),
    prisma.cafeSettings.deleteMany(),
  ]);
};

// Insert a minimal, known dataset used across test suites.
export const seedTestData = async (): Promise<void> => {
  const commonPassword = await bcrypt.hash('12345678', 10);

  await prisma.cafeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      shopName: 'Amanda Coffee Café',
      address: 'Bole, Addis Ababa',
      tablesCount: 8,
      taxPercent: 15,
      servicePercent: 10,
      autoPrintReceipt: true,
    },
  });

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@amanda.com',
        name: 'Admin User',
        role: 'admin',
        passwordHash: commonPassword,
        avatar: '',
      },
      {
        email: 'manager@amanda.com',
        name: 'Manager User',
        role: 'manager',
        passwordHash: commonPassword,
        avatar: '',
      },
      {
        email: 'cashier@amanda.com',
        name: 'Cashier User',
        role: 'cashier',
        passwordHash: commonPassword,
        avatar: '',
      },
      {
        email: 'waiter@amanda.com',
        name: 'Waiter User',
        role: 'waiter',
        passwordHash: commonPassword,
        avatar: '',
      },
      {
        email: 'kitchen@amanda.com',
        name: 'Kitchen User',
        role: 'kitchen',
        passwordHash: commonPassword,
        avatar: '',
      },
    ],
  });

  await prisma.menuItem.createMany({
    data: [
      { name: 'Espresso', price: 55, category: 'Coffee', availability: true },
      { name: 'Cappuccino', price: 75, category: 'Coffee', availability: true },
      { name: 'Black Tea', price: 30, category: 'Tea', availability: true },
      { name: 'Orange Juice', price: 90, category: 'Juice', availability: true },
    ],
  });

  await prisma.diningTable.createMany({
    data: Array.from({ length: 4 }, (_, i) => ({
      number: i + 1,
      capacity: 4,
      status: 'available' as const,
    })),
  });

  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Coffee Beans', quantity: 50, minStock: 10, category: 'Coffee', unit: 'kg' },
      { name: 'Milk', quantity: 20, minStock: 5, category: 'Beverage', unit: 'L' },
    ],
  });
};

// Login helper returning a Bearer token for a given role.
export const loginAs = async (
  role: 'admin' | 'manager' | 'cashier' | 'waiter' | 'kitchen'
): Promise<string> => {
  const app = (await import('../src/app')).default;
  const request = (await import('supertest')).default;
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: `${role}@amanda.com`, password: '12345678' });
  return res.body?.data?.token as string;
};

export const authHeader = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});
