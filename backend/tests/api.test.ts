import { describe, before, beforeEach, after, it } from 'node:test';
import assert from 'node:assert/strict';

// NOTE: setup.ts MUST be imported first so it sets the test DATABASE_URL
// before the Prisma client / app are instantiated.
import { resetDb, seedTestData, loginAs, authHeader } from './setup';
import request from 'supertest';
import createApp from '../src/app';
import { prisma } from '../src/config/prisma';

const app = createApp();

before(async () => {
  await resetDb();
  await seedTestData();
});

after(async () => {
  await resetDb();
  await prisma.$disconnect();
});

// Each test that mutates data reseeds to a known state.
beforeEach(async () => {
  await resetDb();
  await seedTestData();
});

describe('Auth', () => {
  it('POST /api/auth/login returns a token for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@amanda.com',
      password: '12345678',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'admin@amanda.com');
    assert.equal(res.body.data.user.role, 'admin');
    assert.equal(res.body.data.user.passwordHash, undefined);
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@amanda.com',
      password: 'wrongpass',
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('POST /api/auth/login rejects unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@amanda.com',
      password: '12345678',
    });
    assert.equal(res.status, 401);
  });

  it('GET /api/auth/me returns the authenticated user', async () => {
    const token = await loginAs(app, 'admin');
    const res = await request(app).get('/api/auth/me').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, 'admin@amanda.com');
  });

  it('GET /api/auth/me rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
  });

  it('GET /api/auth/me rejects invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set({ Authorization: 'Bearer not.a.jwt' });
    assert.equal(res.status, 401);
  });
});

describe('Menu Items', () => {
  it('GET /api/menu-items is public and lists items', async () => {
    const res = await request(app).get('/api/menu-items');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 4);
    const espresso = res.body.data.find((i: any) => i.name === 'Espresso');
    assert.equal(espresso.availability, true);
  });

  it('GET /api/menu-items filters by category', async () => {
    const res = await request(app).get('/api/menu-items?category=Coffee');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((i: any) => i.category === 'Coffee' || i.category === 'Coffee'));
  });

  it('POST /api/menu-items requires admin role', async () => {
    const res = await request(app).post('/api/menu-items').send({
      name: 'Latte',
      price: 80,
      category: 'Coffee',
    });
    assert.equal(res.status, 401);
  });

  it('POST /api/menu-items as admin creates an item', async () => {
    const token = await loginAs(app, 'admin');
    const res = await request(app)
      .post('/api/menu-items')
      .set(authHeader(token))
      .send({ name: 'Latte', price: 80, category: 'Coffee', availability: true });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, 'Latte');
  });

  it('POST /api/menu-items rejects a waiter', async () => {
    const token = await loginAs(app, 'waiter');
    const res = await request(app)
      .post('/api/menu-items')
      .set(authHeader(token))
      .send({ name: 'Latte', price: 80, category: 'Coffee' });
    assert.equal(res.status, 403);
  });

  it('PATCH /api/menu-items/:id updates an item / toggles availability', async () => {
    const token = await loginAs(app, 'admin');
    const item = await prisma.menuItem.findFirst({ where: { name: 'Espresso' } });
    const res = await request(app)
      .patch(`/api/menu-items/${item!.id}`)
      .set(authHeader(token))
      .send({ availability: false });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.availability, false);
  });

  it('DELETE /api/menu-items/:id removes an item', async () => {
    const token = await loginAs(app, 'admin');
    const item = await prisma.menuItem.findFirst({ where: { name: 'Black Tea' } });
    const res = await request(app).delete(`/api/menu-items/${item!.id}`).set(authHeader(token));
    assert.equal(res.status, 200);
  });
});

describe('Tables', () => {
  it('GET /api/tables lists tables', async () => {
    const res = await request(app).get('/api/tables');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 4);
  });

  it('PATCH /api/tables/:id updates table status as waiter', async () => {
    const token = await loginAs(app, 'waiter');
    const table = await prisma.diningTable.findFirst();
    const res = await request(app)
      .patch(`/api/tables/${table!.id}`)
      .set(authHeader(token))
      .send({ status: 'occupied' });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'occupied');
  });

  it('PATCH /api/tables/:id rejects kitchen role', async () => {
    const token = await loginAs(app, 'kitchen');
    const table = await prisma.diningTable.findFirst();
    const res = await request(app)
      .patch(`/api/tables/${table!.id}`)
      .set(authHeader(token))
      .send({ status: 'occupied' });
    assert.equal(res.status, 403);
  });
});

describe('Orders', () => {
  const buildOrderPayload = () => {
    return {
      tableId: '', // filled per-test
      customerName: 'Test Customer',
      items: [
        { menuItemId: '', quantity: 2 },
        { menuItemId: '', quantity: 1 },
      ],
    };
  };

  it('POST /api/orders creates a customer order (public)', async () => {
    const table = await prisma.diningTable.findFirst();
    const [espresso, cappuccino] = await prisma.menuItem.findMany({
      where: { name: { in: ['Espresso', 'Cappuccino'] } },
    });
    const payload = {
      tableId: table!.id,
      customerName: 'Public Customer',
      items: [
        { menuItemId: espresso!.id, quantity: 2 },
        { menuItemId: cappuccino!.id, quantity: 1 },
      ],
    };
    const res = await request(app).post('/api/orders').send(payload);
    assert.equal(res.status, 201);
    assert.equal(res.body.message, 'Order placed successfully! Sending to kitchen...');
    const order = res.body.data;
    assert.equal(order.customerName, 'Public Customer');
    // 2*55 + 1*75 = 185
    assert.equal(order.subtotal, 185);
    assert.ok(order.items.length === 2 && order.items[0].menuItem.id);
  });

  it('POST /api/orders marks the table occupied', async () => {
    const table = await prisma.diningTable.findFirst();
    const item = await prisma.menuItem.findFirst();
    const res = await request(app).post('/api/orders').send({
      tableId: table!.id,
      customerName: 'Customer',
      items: [{ menuItemId: item!.id, quantity: 1 }],
    });
    assert.equal(res.status, 201);
    const updatedTable = await prisma.diningTable.findUnique({ where: { id: table!.id } });
    assert.equal(updatedTable!.status, 'occupied');
    assert.equal(updatedTable!.currentOrderId, res.body.data.id);
  });

  it('POST /api/orders rejects an empty item list', async () => {
    const table = await prisma.diningTable.findFirst();
    const res = await request(app).post('/api/orders').send({
      tableId: table!.id,
      items: [],
    });
    assert.equal(res.status, 400);
  });

  it('POST /api/orders/staff creates a staff order (authenticated)', async () => {
    const token = await loginAs(app, 'waiter');
    const table = await prisma.diningTable.findFirst({ where: { status: 'available' } });
    const item = await prisma.menuItem.findFirst();
    const res = await request(app)
      .post('/api/orders/staff')
      .set(authHeader(token))
      .send({ tableId: table!.id, customerName: 'Staff Customer', items: [{ menuItemId: item!.id, quantity: 3 }] });
    assert.equal(res.status, 201);
    assert.equal(res.body.message, 'Order logged successfully');
  });

  it('GET /api/orders requires auth', async () => {
    const res = await request(app).get('/api/orders');
    assert.equal(res.status, 401);
  });

  it('GET /api/orders lists orders for a staff member with filters', async () => {
    const token = await loginAs(app, 'cashier');
    const table = await prisma.diningTable.findFirst({ where: { status: 'available' } });
    const item = await prisma.menuItem.findFirst();
    // create one paid + one pending
    const created = await request(app).post('/api/orders').send({
      tableId: table!.id,
      items: [{ menuItemId: item!.id, quantity: 1 }],
    });
    const orderId = created.body.data.id;

    const res = await request(app).get('/api/orders?status=pending').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.ok(res.body.data.some((o: any) => o.id === orderId));
  });

  it('PATCH /api/orders/:id/status transitions pending->preparing->ready->served->completed', async () => {
    const token = await loginAs(app, 'waiter');
    const table = await prisma.diningTable.findFirst({ where: { status: 'available' } });
    const item = await prisma.menuItem.findFirst();
    const created = await request(app).post('/api/orders').send({
      tableId: table!.id,
      items: [{ menuItemId: item!.id, quantity: 1 }],
    });
    const id = created.body.data.id;

    const transitions = ['preparing', 'ready', 'served', 'completed'];
    for (const status of transitions) {
      const res = await request(app)
        .patch(`/api/orders/${id}/status`)
        .set(authHeader(token))
        .send({ status });
      assert.equal(res.status, 200, `status ${status} should succeed`);
      assert.equal(res.body.data.status, status);
    }
  });

  it('PATCH /api/orders/:id/status rejects invalid transition', async () => {
    const token = await loginAs(app, 'waiter');
    const table = await prisma.diningTable.findFirst({ where: { status: 'available' } });
    const item = await prisma.menuItem.findFirst();
    const created = await request(app).post('/api/orders').send({
      tableId: table!.id,
      items: [{ menuItemId: item!.id, quantity: 1 }],
    });
    const id = created.body.data.id;
    // pending -> served directly is invalid
    const res = await request(app)
      .patch(`/api/orders/${id}/status`)
      .set(authHeader(token))
      .send({ status: 'served' });
    assert.equal(res.status, 400);
  });

  it('PATCH /api/orders/:id/pay processes a cash payment', async () => {
    const token = await loginAs(app, 'cashier');
    const table = await prisma.diningTable.findFirst({ where: { status: 'available' } });
    const item = await prisma.menuItem.findFirst();
    const created = await request(app).post('/api/orders').send({
      tableId: table!.id,
      items: [{ menuItemId: item!.id, quantity: 1 }],
    });
    const id = created.body.data.id;
    const total = created.body.data.total;

    const res = await request(app)
      .patch(`/api/orders/${id}/pay`)
      .set(authHeader(token))
      .send({ method: 'cash', discount: 0, amountPaid: total });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.paymentStatus, 'paid');
  });

  it('PATCH /api/orders/:id/pay rejects a waiter role', async () => {
    const token = await loginAs(app, 'waiter');
    const table = await prisma.diningTable.findFirst({ where: { status: 'available' } });
    const item = await prisma.menuItem.findFirst();
    const created = await request(app).post('/api/orders').send({
      tableId: table!.id,
      items: [{ menuItemId: item!.id, quantity: 1 }],
    });
    const id = created.body.data.id;
    const res = await request(app)
      .patch(`/api/orders/${id}/pay`)
      .set(authHeader(token))
      .send({ method: 'cash', discount: 0, amountPaid: 999 });
    assert.equal(res.status, 403);
  });

  it('PATCH /api/orders/:id/cancel frees the table', async () => {
    const token = await loginAs(app, 'waiter');
    const table = await prisma.diningTable.findFirst({ where: { status: 'available' } });
    const item = await prisma.menuItem.findFirst();
    const created = await request(app).post('/api/orders').send({
      tableId: table!.id,
      items: [{ menuItemId: item!.id, quantity: 1 }],
    });
    const id = created.body.data.id;
    const res = await request(app).patch(`/api/orders/${id}/cancel`).set(authHeader(token));
    assert.equal(res.status, 200);
    const freed = await prisma.diningTable.findUnique({ where: { id: table!.id } });
    assert.equal(freed!.status, 'available');
    assert.equal(freed!.currentOrderId, null);
  });
});

describe('Inventory', () => {
  it('GET /api/inventory lists items for admin', async () => {
    const token = await loginAs(app, 'admin');
    const res = await request(app).get('/api/inventory').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 2);
  });

  it('GET /api/inventory rejects a waiter', async () => {
    const token = await loginAs(app, 'waiter');
    const res = await request(app).get('/api/inventory').set(authHeader(token));
    assert.equal(res.status, 403);
  });

  it('PATCH /api/inventory/:id/adjust restocks an item', async () => {
    const token = await loginAs(app, 'admin');
    const item = await prisma.inventoryItem.findFirst({ where: { name: 'Coffee Beans' } });
    const res = await request(app)
      .patch(`/api/inventory/${item!.id}/adjust`)
      .set(authHeader(token))
      .send({ quantity: 10, type: 'in', note: 'restock' });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.currentStock, 60);
    assert.equal(res.body.data.status, 'in_stock');
  });

  it('PATCH /api/inventory/:id/adjust records a stock movement', async () => {
    const token = await loginAs(app, 'admin');
    const item = await prisma.inventoryItem.findFirst({ where: { name: 'Coffee Beans' } });
    await request(app)
      .patch(`/api/inventory/${item!.id}/adjust`)
      .set(authHeader(token))
      .send({ quantity: 10, type: 'out', note: 'daily use' });
    const movements = await prisma.stockMovement.findMany({ orderBy: { timestamp: 'desc' } });
    assert.ok(movements.length >= 1);
    assert.equal(movements[0].type, 'out');
  });
});

describe('Expenses', () => {
  it('POST /api/expenses creates an expense for manager', async () => {
    const token = await loginAs(app, 'manager');
    const res = await request(app)
      .post('/api/expenses')
      .set(authHeader(token))
      .send({ category: 'Utilities', amount: 500, description: 'Electricity bill', date: '2026-09-01' });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.amount, 500);
  });

  it('POST /api/expenses rejects a cashier', async () => {
    const token = await loginAs(app, 'cashier');
    const res = await request(app)
      .post('/api/expenses')
      .set(authHeader(token))
      .send({ category: 'Utilities', amount: 100, description: 'x', date: '2026-09-01' });
    assert.equal(res.status, 403);
  });

  it('GET /api/expenses lists expenses for manager', async () => {
    const token = await loginAs(app, 'manager');
    await request(app)
      .post('/api/expenses')
      .set(authHeader(token))
      .send({ category: 'Rent', amount: 1000, description: 'Monthly', date: '2026-09-01' });
    const res = await request(app).get('/api/expenses').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
  });
});

describe('Notifications', () => {
  it('GET /api/notifications lists notifications for any staff', async () => {
    const token = await loginAs(app, 'kitchen');
    const res = await request(app).get('/api/notifications').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it('PATCH /api/notifications/:id/read marks a notification read', async () => {
    const token = await loginAs(app, 'admin');
    // create an order to generate a notification
    const table = await prisma.diningTable.findFirst({ where: { status: 'available' } });
    const item = await prisma.menuItem.findFirst();
    await request(app).post('/api/orders').send({ tableId: table!.id, items: [{ menuItemId: item!.id, quantity: 1 }] });
    const notif = await prisma.notification.findFirst();
    const res = await request(app).patch(`/api/notifications/${notif!.id}/read`).set(authHeader(token));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.isRead, true);
  });

  it('PATCH /api/notifications/read-all marks all read', async () => {
    const token = await loginAs(app, 'admin');
    const res = await request(app).patch('/api/notifications/read-all').set(authHeader(token));
    assert.equal(res.status, 200);
    const unread = await prisma.notification.count({ where: { isRead: false } });
    assert.equal(unread, 0);
  });
});

describe('Dashboard', () => {
  it('GET /api/dashboard/stats returns metrics for cashier', async () => {
    const token = await loginAs(app, 'cashier');
    const res = await request(app).get('/api/dashboard/stats').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.ok('todaySales' in res.body.data);
    assert.ok('monthlySales' in res.body.data);
    assert.ok('dailyOrdersCount' in res.body.data);
  });

  it('GET /api/dashboard/reports/summary requires manager role', async () => {
    const cashierToken = await loginAs(app, 'cashier');
    const res = await request(app).get('/api/dashboard/reports/summary').set(authHeader(cashierToken));
    assert.equal(res.status, 403);

    const managerToken = await loginAs(app, 'manager');
    const res2 = await request(app).get('/api/dashboard/reports/summary').set(authHeader(managerToken));
    assert.equal(res2.status, 200);
    assert.ok('grossSales' in res2.body.data);
    assert.ok('netProfit' in res2.body.data);
  });

  it('GET /api/dashboard/reports/category-sales returns categories', async () => {
    const token = await loginAs(app, 'manager');
    const res = await request(app).get('/api/dashboard/reports/category-sales').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it('GET /api/dashboard/reports/best-sellers returns list for cashier', async () => {
    const token = await loginAs(app, 'cashier');
    const res = await request(app).get('/api/dashboard/reports/best-sellers').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });
});

describe('Settings', () => {
  it('GET /api/settings returns settings for any staff', async () => {
    const token = await loginAs(app, 'waiter');
    const res = await request(app).get('/api/settings').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.shopName, 'Amanda Coffee Café');
  });

  it('PATCH /api/settings updates settings for admin only', async () => {
    const adminToken = await loginAs(app, 'admin');
    const res = await request(app)
      .patch('/api/settings')
      .set(authHeader(adminToken))
      .send({ taxPercent: 20, servicePercent: 5 });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.taxPercent, 20);
    assert.equal(res.body.data.servicePercent, 5);
  });

  it('PATCH /api/settings rejects a manager', async () => {
    const token = await loginAs(app, 'manager');
    const res = await request(app).patch('/api/settings').set(authHeader(token)).send({ taxPercent: 20 });
    assert.equal(res.status, 403);
  });
});

describe('Users (admin only)', () => {
  it('GET /api/users lists staff for admin', async () => {
    const token = await loginAs(app, 'admin');
    const res = await request(app).get('/api/users').set(authHeader(token));
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 5);
    assert.equal(res.body.data[0].passwordHash, undefined);
  });

  it('GET /api/users rejects a manager', async () => {
    const token = await loginAs(app, 'manager');
    const res = await request(app).get('/api/users').set(authHeader(token));
    assert.equal(res.status, 403);
  });

  it('POST /api/users creates a new staff member', async () => {
    const token = await loginAs(app, 'admin');
    const res = await request(app)
      .post('/api/users')
      .set(authHeader(token))
      .send({ email: 'newstaff@amanda.com', name: 'New Staff', role: 'waiter', password: '12345678' });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.email, 'newstaff@amanda.com');
  });

  it('POST /api/users rejects a duplicate email', async () => {
    const token = await loginAs(app, 'admin');
    const res = await request(app)
      .post('/api/users')
      .set(authHeader(token))
      .send({ email: 'admin@amanda.com', name: 'Dup', role: 'waiter', password: '12345678' });
    assert.equal(res.status, 409);
  });

  it('PATCH /api/users/:id updates a user', async () => {
    const token = await loginAs(app, 'admin');
    const user = await prisma.user.findFirst({ where: { email: 'manager@amanda.com' } });
    const res = await request(app)
      .patch(`/api/users/${user!.id}`)
      .set(authHeader(token))
      .send({ name: 'Renamed Manager' });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.name, 'Renamed Manager');
  });

  it('DELETE /api/users/:id removes a user', async () => {
    const token = await loginAs(app, 'admin');
    const user = await prisma.user.findFirst({ where: { email: 'cashier@amanda.com' } });
    const res = await request(app).delete(`/api/users/${user!.id}`).set(authHeader(token));
    assert.equal(res.status, 200);
  });
});

describe('Health & Errors', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'ok');
  });

  it('Returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
