import { Router } from 'express';
import { getExpenses, createExpenseHandler, deleteExpenseHandler } from '../controllers/expense.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';
import { createExpenseValidator } from '../validators/expense.validator';
import { orderIdParamValidator } from '../validators/order.validator';

const router = Router();

// Expenses require admin/manager
router.use(authenticate, authorize(Role.admin, Role.manager));

// GET /api/expenses - list all expenses
router.get('/', getExpenses);

// POST /api/expenses - create expense
router.post('/', createExpenseValidator, validate, createExpenseHandler);

// DELETE /api/expenses/:id - delete expense
router.delete('/:id', orderIdParamValidator, validate, deleteExpenseHandler);

export default router;
