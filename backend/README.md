# Amanda Coffee Café — Backend REST API

A complete, production-structured REST API backend for the **Amanda Coffee Cafe Management System**, powered by **Express.js + TypeScript + Prisma + PostgreSQL**.

The API is built strictly from the existing **React frontend's** data requirements — every feature, endpoint, and response shape is derived from what the frontend pages actually use (dashboard, menu, tables, ordering, kitchen display, checkout, inventory, expenses, reports, settings, staff management).

---

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Runtime    | Node.js 24 (ESM)                            |
| Language   | TypeScript (strict)                         |
| Framework  | Express 4                                   |
| ORM        | Prisma 6 (PostgreSQL)                       |
| Validation | express-validator                           |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs` passwords |
| Security   | `helmet`, `cors`, `morgan` logging          |
| Testing    | Node `node:test` + `supertest`              |

---

## Getting Started

### 1. Prerequisites

- **Node.js** 20+ (tested on 24)
- **PostgreSQL** 14+ running locally
- A Postgres user with database creation rights

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

Copy the example file and edit the values:

```bash
cp .env.example .env
```

Required variables (see `.env.example`):

| Variable         | Description                              | Default                                  |
| ---------------- | ---------------------------------------- | ---------------------------------------- |
| `PORT`           | API port                                 | `5000`                                   |
| `NODE_ENV`       | `development` / `production` / `test`    | `development`                            |
| `DATABASE_URL`   | PostgreSQL connection string             | `postgresql://postgres:postgres@localhost:5432/amanda_cafe` |
| `JWT_SECRET`     | Signing secret for JWTs                  | dev fallback (change in production)      |
| `JWT_EXPIRES_IN` | Token lifetime                           | `7d`                                     |
| `CORS_ORIGIN`    | Allowed frontend origin                  | `http://localhost:3000`                  |

### 4. Create and migrate the database

```bash
# Creates the database + applies all migrations
npx prisma migrate dev
```

This creates the `amanda_cafe` development database with all tables.

### 5. Seed demo data

```bash
npm run prisma:seed
```

The seed creates 5 staff accounts, 16 menu items, 8 tables, inventory, notifications, expenses, and café settings.

### 6. Run the server (development)

```bash
npm run dev
```

The API listens at `http://localhost:5000` (health check: `GET /api/health`).

---

## Demo Accounts (password: `12345678` for all)

| Email                 | Role     |
| --------------------- | -------- |
| `admin@amanda.com`    | Admin    |
| `manager@amanda.com`  | Manager  |
| `cashier@amanda.com`  | Cashier  |
| `waiter@amanda.com`   | Waiter   |
| `kitchen@amanda.com`  | Kitchen  |

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (models, enums)
│   ├── seed.ts                # Demo data seeder
│   └── migrations/            # SQL migrations (created via migrate dev)
├── src/
│   ├── app.ts                 # Express app (middleware + route mounting)
│   ├── server.ts              # Entry point (starts listening)
│   ├── config/
│   │   ├── index.ts           # Env configuration
│   │   └── prisma.ts          # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts            # authenticate (JWT) + authorize (role) guards
│   │   ├── errorHandler.ts    # ApiError class + centralized handlers
│   │   └── validate.ts        # express-validator result handler
│   ├── controllers/           # Request/response handlers
│   ├── services/              # Business logic (Prisma access)
│   ├── validators/            # express-validator rule arrays
│   ├── routes/                # Express routers (one per resource)
│   ├── types/                 # Shared TS types (auth payload, request augment)
│   └── utils/
│       └── apiResponse.ts     # successResponse / errorResponse helpers
├── tests/                     # Automated tests (node:test + supertest)
├── postman/                   # Postman collection
├── .env.example
└── package.json
```

**Layering:** `routes → controllers → services → Prisma`. Controllers parse requests and shape responses; services hold all business logic; validation is enforced at the route level.

---

## Database Schema

Tables: **User**, **MenuItem**, **DiningTable**, **Order**, **OrderItem**, **InventoryItem**, **StockMovement**, **Expense**, **Notification**, **CafeSettings**.

Key design decisions:

- **OrderItem snapshots** `itemName` and `itemPrice` at order time, so past orders are unaffected by later menu edits/deletions (matches frontend behaviour).
- **`DiningTable.currentOrderId`** is a plain string column (not a Prisma relation) — the true foreign key is `Order.tableId → DiningTable.id`. This avoids a tricky 1:1 relation.
- **Category mapping**: the DB enum stores `Soft_Drinks`; services map it to/from the display string `Soft Drinks` used by the frontend.
- All monetary values use **Decimal(10,2)** via Prisma's `Decimal` type.

### Enums

- `Role`: `admin`, `manager`, `cashier`, `waiter`, `kitchen`
- `Category`: `Coffee`, `Tea`, `Juice`, `Food`, `Soft_Drinks`
- `OrderStatus`: `pending`, `preparing`, `ready`, `served`, `completed`, `cancelled`
- `PaymentStatus`: `unpaid`, `paid`
- `PaymentMethod`: `cash`, `telebirr`, `other`
- `TableStatus`: `available`, `occupied`
- `InventoryStatus`: `in_stock`, `low_stock`, `critical`, `out_of_stock`
- `StockMovementType`: `in`, `out`, `adjust`
- `OrderSource`: `customer`, `staff`
- `NotificationType`: `new_order`, `order_ready`, `payment_confirmation`, `low_stock`

---

## Authentication & Authorization

- **`POST /api/auth/login`** (public) verifies email + bcrypt password and returns `{ token, user }` (password hash stripped).
- Protected routes require the header:

  ```
  Authorization: Bearer <token>
  ```

- **`authorize(...roles)`** guards enforce role-based access per route.

### Role access matrix

| Endpoint                                | Public | admin | manager | cashier | waiter | kitchen |
| --------------------------------------- | :----: | :---: | :-----: | :-----: | :----: | :-----: |
| `POST /auth/login`, `GET /auth/me`      | login  |  ✔   |   ✔    |    ✔    |   ✔   |    ✔    |
| `GET /menu-items`                       |   ✔   |       |         |         |        |         |
| `POST/PATCH/DELETE /menu-items`         |        |  ✔   |   ✔    |         |        |         |
| `GET /tables`                           |   ✔   |       |         |         |        |         |
| `PATCH /tables/:id`                     |        |  ✔   |   ✔    |    ✔    |   ✔   |         |
| `POST /orders` (customer)               |   ✔   |       |         |         |        |         |
| `POST /orders/staff`                    |        |  ✔   |   ✔    |    ✔    |   ✔   |         |
| `GET /orders`                           |        |  ✔   |   ✔    |    ✔    |   ✔   |    ✔    |
| `PATCH /orders/:id/status`              |        |  ✔   |   ✔    |    ✔    |   ✔   |    ✔    |
| `PATCH /orders/:id/cancel`              |        |  ✔   |   ✔    |    ✔    |   ✔   |         |
| `PATCH /orders/:id/pay`                 |        |  ✔   |   ✔    |    ✔    |       |         |
| `PATCH /orders/:id/items`               |        |  ✔   |   ✔    |    ✔    |   ✔   |         |
| `/inventory/*`                          |        |  ✔   |   ✔    |         |        |         |
| `/expenses/*`                           |        |  ✔   |   ✔    |         |        |         |
| `GET /notifications`, mark read         |        |  ✔   |   ✔    |    ✔    |   ✔   |    ✔    |
| `GET /dashboard/stats`                  |        |  ✔   |   ✔    |    ✔    |       |         |
| `GET /dashboard/reports/*`              |        |  ✔   |   ✔    | best-sellers |   |         |
| `GET /settings`                         |        |  ✔   |   ✔    |    ✔    |   ✔   |    ✔    |
| `PATCH /settings`                       |        |  ✔   |         |         |        |         |
| `/users/*`                              |        |  ✔   |         |         |        |         |

---

## API Endpoints

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint      | Description                  |
| ------ | ------------- | ---------------------------- |
| POST   | `/auth/login` | Login, returns token + user  |
| GET    | `/auth/me`    | Current authenticated user   |

### Users (admin only)
| Method | Endpoint     | Description           |
| ------ | ------------ | --------------------- |
| GET    | `/users`     | List all staff        |
| POST   | `/users`     | Create a staff member |
| PATCH  | `/users/:id` | Update a user         |
| DELETE | `/users/:id` | Delete a user         |

### Menu Items
| Method | Endpoint             | Description                                  |
| ------ | -------------------- | -------------------------------------------- |
| GET    | `/menu-items`        | List items (supports `?search=&category=&availability=`) |
| GET    | `/menu-items/:id`    | Get a single item                            |
| POST   | `/menu-items`        | Create (admin/manager)                       |
| PATCH  | `/menu-items/:id`    | Update / toggle availability (admin/manager) |
| DELETE | `/menu-items/:id`    | Delete (admin/manager)                       |

### Tables
| Method | Endpoint        | Description                            |
| ------ | --------------- | -------------------------------------- |
| GET    | `/tables`       | List tables                            |
| GET    | `/tables/:id`   | Get a table                            |
| PATCH  | `/tables/:id`   | Update status (available/occupied)     |

### Orders
| Method | Endpoint              | Description                                    |
| ------ | --------------------- | ---------------------------------------------- |
| POST   | `/orders`             | Customer self-service order (public)           |
| POST   | `/orders/staff`       | Staff-created order                            |
| GET    | `/orders`             | List (supports `?status=&search=&orderSource=`)|
| GET    | `/orders/:id`         | Get single order                               |
| PATCH  | `/orders/:id/status`  | Transition status                              |
| PATCH  | `/orders/:id/cancel`  | Cancel order (frees table)                     |
| PATCH  | `/orders/:id/pay`     | Process payment                                 |
| PATCH  | `/orders/:id/items`   | Add items to an existing order                 |

### Inventory (admin/manager)
| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| GET    | `/inventory`              | List inventory items           |
| GET    | `/inventory/history`      | Stock movement history         |
| GET    | `/inventory/:id`          | Get item                       |
| PATCH  | `/inventory/:id/adjust`   | Adjust stock (`in`/`out`/`adjust`) |

### Expenses (admin/manager)
| Method | Endpoint       | Description      |
| ------ | -------------- | ---------------- |
| GET    | `/expenses`    | List expenses    |
| POST   | `/expenses`    | Create expense   |
| DELETE | `/expenses/:id`| Delete expense   |

### Notifications
| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| GET    | `/notifications`               | List notifications     |
| PATCH  | `/notifications/:id/read`      | Mark one as read       |
| PATCH  | `/notifications/read-all`      | Mark all as read       |

### Dashboard & Reports
| Method | Endpoint                                | Description        |
| ------ | --------------------------------------- | ------------------ |
| GET    | `/dashboard/stats`                      | Dashboard metrics  |
| GET    | `/dashboard/reports/summary`            | Gross/expenses/net (admin/manager, optional `from`/`to`) |
| GET    | `/dashboard/reports/category-sales`     | Sales by category (admin/manager) |
| GET    | `/dashboard/reports/best-sellers`       | Top sellers        |

### Settings
| Method | Endpoint     | Description            |
| ------ | ------------ | ---------------------- |
| GET    | `/settings`  | Get café settings      |
| PATCH  | `/settings`  | Update settings (admin)|

### System
| Method | Endpoint    | Description    |
| ------ | ----------- | -------------- |
| GET    | `/health`   | Health check   |

---

## Response Format

All endpoints return a consistent JSON envelope.

**Success:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "...": "..." },
  "meta": { "...": "..." }   // optional
}
```

**Error:**
```json
{
  "success": false,
  "message": "Invalid email or password.",
  "error": "INVALID_CREDENTIALS",
  "errors": { "...": "..." }  // optional, validation details
}
```

Error codes: `UNAUTHORIZED`, `FORBIDDEN`, `INVALID_CREDENTIALS`, `NOT_FOUND`, `DUPLICATE_RECORD`, `VALIDATION_ERROR`, `INTERNAL_SERVER_ERROR`, etc.

---

## Testing

Tests use the Node built-in test runner (`node:test`) with `supertest` against a **separate** PostgreSQL database (`amanda_cafe_test`) so they never touch dev data.

### 1. Create and migrate the test database

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amanda_cafe_test" \
  npx prisma migrate deploy
```

> On Windows PowerShell:
> ```powershell
> $env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amanda_cafe_test"
> npx prisma migrate deploy
> ```

### 2. Run the suite

```bash
npm test
```

The suite automatically resets and reseeds the test database before each test. It covers auth, role-based access control, menu, tables, orders (create/transition/pay/cancel), inventory, expenses, notifications, dashboard, settings, users, and health/404 handling.

**Current status: 52 tests, all passing.**

---

## npm Scripts

| Script               | Description                                   |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Run dev server with hot reload (`tsx watch`)  |
| `npm run build`      | Compile TypeScript to `dist/`                 |
| `npm start`          | Run the compiled build                        |
| `npm run lint`       | Type-check without emitting (`tsc --noEmit`)  |
| `npm test`           | Run automated tests                           |
| `npm run prisma:generate` | Generate the Prisma client               |
| `npm run prisma:migrate`  | Create/apply a new migration             |
| `npm run prisma:deploy`   | Apply pending migrations in production   |
| `npm run prisma:seed`     | Seed the development database           |

---

## Postman Collection

A ready-to-use collection is provided at:

```
postman/amanda-coffee-api.postman_collection.json
```

**Usage:**
1. Open Postman → *Import* → select the JSON file.
2. The collection defines a `baseUrl` variable (default `http://localhost:5000/api`).
3. Run the **Login** request first — its test script automatically stores the returned token in the `token` collection variable.
4. All subsequent requests use that token automatically.

---

## Deliverables

- ✅ Full Express + TypeScript backend
- ✅ Prisma schema, migrations, and seed
- ✅ Role-based JWT authentication
- ✅ 52 automated tests (all passing)
- ✅ Postman collection
- ✅ This README
- 📄 Final implementation report (delivered separately)
