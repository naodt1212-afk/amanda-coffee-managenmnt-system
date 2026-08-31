import { Router } from 'express';
import {
  getUsers,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';
import {
  createUserValidator,
  updateUserValidator,
  userIdParamValidator,
} from '../validators/user.validator';

const router = Router();

// All user routes require admin role
router.use(authenticate, authorize(Role.admin));

// GET /api/users - list all staff (admin)
router.get('/', getUsers);

// POST /api/users - create staff (admin)
router.post('/', createUserValidator, validate, createUserHandler);

// PATCH /api/users/:id - update staff (admin)
router.patch('/:id', updateUserValidator, validate, updateUserHandler);

// DELETE /api/users/:id - delete staff (admin)
router.delete('/:id', userIdParamValidator, validate, deleteUserHandler);

export default router;
