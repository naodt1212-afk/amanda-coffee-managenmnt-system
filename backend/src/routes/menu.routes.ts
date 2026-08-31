import { Router } from 'express';
import {
  getMenuItems,
  getMenuItem,
  createMenuItemHandler,
  updateMenuItemHandler,
  deleteMenuItemHandler,
} from '../controllers/menu.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';
import {
  createMenuItemValidator,
  updateMenuItemValidator,
  menuItemIdParamValidator,
} from '../validators/menu.validator';

const router = Router();

// GET /api/menu-items - public list (customer-facing menu)
router.get('/', getMenuItems);

// GET /api/menu-items/:id - public
router.get('/:id', menuItemIdParamValidator, validate, getMenuItem);

// POST /api/menu-items - admin/manager only
router.post(
  '/',
  authenticate,
  authorize(Role.admin, Role.manager),
  createMenuItemValidator,
  validate,
  createMenuItemHandler
);

// PATCH /api/menu-items/:id - admin/manager only (includes availability toggle)
router.patch(
  '/:id',
  authenticate,
  authorize(Role.admin, Role.manager),
  updateMenuItemValidator,
  validate,
  updateMenuItemHandler
);

// DELETE /api/menu-items/:id - admin/manager only
router.delete(
  '/:id',
  authenticate,
  authorize(Role.admin, Role.manager),
  menuItemIdParamValidator,
  validate,
  deleteMenuItemHandler
);

export default router;
