import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createCustomerOrderHandler,
  createStaffOrderHandler,
  updateOrderStatusHandler,
  cancelOrderHandler,
  payOrderHandler,
  addItemsHandler,
} from '../controllers/order.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';
import {
  createOrderValidator,
  updateOrderStatusValidator,
  payOrderValidator,
  addItemsValidator,
  orderIdParamValidator,
} from '../validators/order.validator';

const router = Router();

// POST /api/orders - customer self-service order (public)
router.post('/', createOrderValidator, validate, createCustomerOrderHandler);

// POST /api/orders/staff - staff-created order (authenticated staff)
router.post(
  '/staff',
  authenticate,
  authorize(Role.admin, Role.manager, Role.cashier, Role.waiter),
  createOrderValidator,
  validate,
  createStaffOrderHandler
);

// All remaining order routes require authentication
router.use(authenticate);

// GET /api/orders - list orders (any staff)
router.get('/', getOrders);

// GET /api/orders/:id - single order
router.get('/:id', orderIdParamValidator, validate, getOrder);

// PATCH /api/orders/:id/status - update status (admin/manager/cashier/waiter/kitchen)
router.patch(
  '/:id/status',
  authorize(Role.admin, Role.manager, Role.cashier, Role.waiter, Role.kitchen),
  updateOrderStatusValidator,
  validate,
  updateOrderStatusHandler
);

// PATCH /api/orders/:id/cancel - cancel order (admin/manager/cashier/waiter)
router.patch(
  '/:id/cancel',
  authorize(Role.admin, Role.manager, Role.cashier, Role.waiter),
  orderIdParamValidator,
  validate,
  cancelOrderHandler
);

// PATCH /api/orders/:id/pay - process payment (admin/manager/cashier)
router.patch(
  '/:id/pay',
  authorize(Role.admin, Role.manager, Role.cashier),
  payOrderValidator,
  validate,
  payOrderHandler
);

// PATCH /api/orders/:id/items - add items to existing order (admin/manager/cashier/waiter)
router.patch(
  '/:id/items',
  authorize(Role.admin, Role.manager, Role.cashier, Role.waiter),
  addItemsValidator,
  validate,
  addItemsHandler
);

export default router;
