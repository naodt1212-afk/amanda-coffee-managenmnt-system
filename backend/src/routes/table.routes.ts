import { Router } from 'express';
import { getTables, getTable, updateTableStatusHandler } from '../controllers/table.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';
import { tableStatusValidator, tableIdParamValidator } from '../validators/table.validator';

const router = Router();

// GET /api/tables - public (customer table selection)
router.get('/', getTables);

// GET /api/tables/:id - public (customer)
router.get('/:id', tableIdParamValidator, validate, getTable);

// PATCH /api/tables/:id - staff roles (mark occupied/available)
router.patch(
  '/:id',
  authenticate,
  authorize(Role.admin, Role.manager, Role.cashier, Role.waiter),
  tableStatusValidator,
  validate,
  updateTableStatusHandler
);

export default router;
