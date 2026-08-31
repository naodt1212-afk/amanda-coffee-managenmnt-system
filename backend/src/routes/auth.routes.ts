import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller';
import { loginValidator } from '../validators/auth.validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/login - public
router.post('/login', loginValidator, validate, login);

// GET /api/auth/me - authenticated
router.get('/me', authenticate, getMe);

export default router;
