# Amanda Coffee Café — Backend Implementation Report

## Overview

A complete REST API backend for the **Amanda Coffee Cafe Management System** was built with **Express.js + TypeScript + Prisma + PostgreSQL**. The scope was derived strictly from the existing **React frontend**, ensuring every endpoint and data shape matches what the UI actually consumes. **The frontend was not modified.**

---

## 1. Frontend Analysis (Source of Truth)

All ~15 pages, the `types.ts`, `mockData`, and `AppContext.tsx` were analyzed to enumerate:

- **Dashboard**: today's sales, daily orders, monthly sales, active customers, expenses, net profit.
- **Menu**: items with name, description, price, category, image, availability, preparation time; category/availability toggles.
- **Tables**: table list with status (available/occupied), table selection for ordering.
- **Ordering**: customer self-order + staff order; items with quantity and special instructions; subtotal/total.
- **Kitchen Display**: order status pipeline `pending → preparing → ready → served → completed`.
- **Checkout**: payment (cash / telebirr / other), discount, amount paid; marks order paid + table freed.
- **Reports**: gross sales, expenses, net profit; category sales; best sellers.
- **Inventory**: items, current stock, min stock, status (in/low/critical/out), stock adjustment, movement history.
- **Expenses**: category, amount, description, date.
- **Settings**: shop name, address, tables count, tax %, service %, auto-print receipt.
- **Staff Management**: create/update/delete users with roles.
- **Notifications**: system notifications (new order, order ready, payment, low stock) with read state.

---

## 2. Technology Decisions

| Choice            | Rationale                                                                 |
| ----------------- | ------------------------------------------------------------------------- |
| **Prisma**        | Best-in-class TypeScript DX; mirrors frontend interfaces almost 1:1        |
| **PostgreSQL 18** | Local instance used (user `postgres`, password `postgres`)                  |
| **JWT + bcrypt**  | Stateless auth; hashed passwords (`12345678` for all demo users)           |
| **express-validator** | Declarative request validation at the route layer                      |
| **Layered arch**  | `routes → controllers → services → Prisma` kept clean and testable         |
| **ETB currency**  | All monetary values in Ethiopian Birr, stored as `Decimal(10,2)`           |

---

## 3. Database Schema (10 tables + 10 enums)

```
User        (id, email, name, role, passwordHash, avatar, isActive)
MenuItem    (id, name, description, price, category, image, availability, preparationTime)
DiningTable (id, number, status, currentOrderId)
Order       (id, tableId, tableNumber, subtotal, discount, total, status, paymentStatus,
             paymentMethod, orderSource, customerName, createdAt)
OrderItem   (id, orderId, menuItemId?, itemName, itemPrice, quantity, specialInstructions)
InventoryItem (id, name, currentStock, unit, minStock, status, lastUpdated)
StockMovement (id, itemId, itemName, type, quantity, note, timestamp)
Expense     (id, category, amount, description, date)
Notification(id, type, title, message, isRead, createdAt)
CafeSettings(id=1, shopName, address, tablesCount, taxPercent, servicePercent, autoPrintReceipt)
```

Key modeling decisions:
- **OrderItem snapshots** `itemName`/`itemPrice` so historical orders survive menu edits/deletions (matches frontend).
- **`DiningTable.currentOrderId`** stored as a plain string (real FK is `Order.tableId`).
- **`Soft_Drinks`** stored in DB, mapped to display `"Soft Drinks"` in services.

Migrations applied to `amanda_cafe` (dev) and `amanda_cafe_test` (tests). Seed data populates 5 users, 16 menu items, 8 tables, 3 orders, 9 inventory items, notifications, expenses, and settings.

---

## 4. API Surface (all endpoints)

Base URL: `http://localhost:5000/api`

| Resource      | Endpoints                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| Auth          | `POST /auth/login`, `GET /auth/me`                                         |
| Users (admin) | `GET/POST /users`, `PATCH/DELETE /users/:id`                               |
| Menu          | `GET /menu-items(/:id)`, `POST /menu-items`, `PATCH/DELETE /menu-items/:id`|
| Tables        | `GET /tables(/:id)`, `PATCH /tables/:id`                                   |
| Orders        | `POST /orders` (public), `POST /orders/staff`, `GET /orders(/:id)`,        |
|               | `PATCH /orders/:id/{status,cancel,pay,items}`                              |
| Inventory     | `GET /inventory(/:id)`, `GET /inventory/history`, `PATCH /inventory/:id/adjust` |
| Expenses      | `GET/POST /expenses`, `DELETE /expenses/:id`                               |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Dashboard     | `GET /dashboard/stats`                                                     |
| Reports       | `GET /dashboard/reports/{summary,category-sales,best-sellers}`             |
| Settings      | `GET/PATCH /settings`                                                      |
| System        | `GET /health`                                                              |

Role matrix enforces: admin (everything), manager (dashboard/reports/menu/inventory/expenses), cashier (orders/tables/payments), waiter (orders/tables), kitchen (order status). Customer order creation is public, matching the frontend.

Consistent envelope:
```json
{ "success": true, "message": "...", "data": ..., "meta": ... }
```

---

## 5. Verification

### TypeScript compile
```bash
npx tsc --noEmit   # clean, no errors
```

### Server boot
Server starts on port 5000; `GET /api/health` returns `{"success":true,...}`.
Manual smoke test confirmed: login → `GET /auth/me` (role admin) → `/tables` (8) → `/inventory` (9).

### Automated tests
```bash
npm test
```
Node built-in test runner + supertest against `amanda_cafe_test` DB.
**Result: 52 tests, 52 passing, 0 failing** (exit code 0).

Coverage: auth (login/me/expiry), RBAC (403s for wrong roles), menu CRUD, tables, orders (create, transitions, invalid transitions, pay, cancel, table freeing), inventory adjust + movement log, expenses, notifications, dashboard/reports, settings, users CRUD + duplicate email, health/404.

---

## 6. Files Delivered

```
backend/
├── package.json, tsconfig.json, .env, .env.example, .gitignore
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/20260831220520_init/
├── src/
│   ├── app.ts, server.ts
│   ├── config/  (index.ts, prisma.ts)
│   ├── middleware/ (auth.ts, errorHandler.ts, validate.ts)
│   ├── controllers/ (10 files)
│   ├── services/ (10 files)
│   ├── validators/ (10 files)
│   ├── routes/ (10 files)
│   ├── types/index.ts
│   └── utils/apiResponse.ts
├── tests/ (setup.ts, api.test.ts — 52 assertions scenarios)
├── postman/amanda-coffee-api.postman_collection.json
└── README.md
```

---

## 7. How to Run

```bash
cd backend
npm install
cp .env.example .env          # edit if needed
npx prisma migrate dev        # create + migrate dev DB
npm run prisma:seed           # demo data
npm run dev                   # start API on :5000
# Tests:
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amanda_cafe_test"
npx prisma migrate deploy
npm test
```

Postman: import `postman/amanda-coffee-api.postman_collection.json`; run **Login** first (it auto-stores the token), then any endpoint.

Demo logins (password `12345678`): `admin@amanda.com`, `manager@amanda.com`, `cashier@amanda.com`, `waiter@amanda.com`, `kitchen@amanda.com`.

---

## 8. Notes / Decisions Worth Knowing

- Added explicit `.js`? No — project uses **ESM via `tsx`** with `moduleResolution: Bundler` so extensionless relative imports work (final `tsconfig`).
- **`--test-force-exit`** added to the test script so open Prisma handles don't block the runner from exiting after the suite completes.
- Prisma 6 logs a deprecation notice about `package.json#prisma` (planned for Prisma 7); not a functional blocker.
- The order `buildOrderDisplayId` shows the last 6 chars of the order cuid for display (#-style labels) since orders use cuid ids rather than sequential numbers.
