import { Router } from 'express';
import {
  getNotifications,
  markReadHandler,
  markAllReadHandler,
} from '../controllers/notification.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { orderIdParamValidator } from '../validators/order.validator';

const router = Router();

// All notification routes require authentication (any staff)
router.use(authenticate);

// GET /api/notifications - list notifications
router.get('/', getNotifications);

// PATCH /api/notifications/read-all - mark all as read
router.patch('/read-all', markAllReadHandler);

// PATCH /api/notifications/:id/read - mark single as read
router.patch('/:id/read', orderIdParamValidator, validate, markReadHandler);

export default router;
