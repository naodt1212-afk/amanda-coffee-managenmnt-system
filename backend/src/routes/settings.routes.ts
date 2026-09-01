import { Router } from 'express';
import { getSettingsHandler, updateSettingsHandler } from '../controllers/settings.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';
import { updateSettingsValidator } from '../validators/settings.validator';

const router = Router();

// GET /api/settings - public? No, require auth for consistency
router.get('/', authenticate, getSettingsHandler);

// PATCH /api/settings - admin only
router.patch(
  '/',
  authenticate,
  authorize(Role.admin),
  updateSettingsValidator,
  validate,
  updateSettingsHandler
);

export default router;
