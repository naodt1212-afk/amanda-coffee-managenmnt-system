import { Router } from 'express';
import {
  getInventory,
  getInventoryItemHandler,
  adjustStockHandler,
  getStockHistoryHandler,
} from '../controllers/inventory.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';
import {
  inventoryIdParamValidator,
  adjustStockValidator,
} from '../validators/inventory.validator';

const router = Router();

// All inventory routes require admin/manager
router.use(authenticate, authorize(Role.admin, Role.manager));

// GET /api/inventory - list inventory (admin/manager)
router.get('/', getInventory);

// GET /api/inventory/history - stock movement history (admin/manager)
router.get('/history', getStockHistoryHandler);

// GET /api/inventory/:id - single inventory item (admin/manager)
router.get('/:id', inventoryIdParamValidator, validate, getInventoryItemHandler);

// PATCH /api/inventory/:id/adjust - adjust stock (admin/manager)
router.patch(
  '/:id/adjust',
  adjustStockValidator,
  validate,
  adjustStockHandler
);

export default router;
