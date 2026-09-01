import { Router } from 'express';
import {
  getStats,
  getSummary,
  getCategorySalesHandler,
  getBestSellersHandler,
} from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Dashboard stats require authenticated staff
router.use(authenticate);

// GET /api/dashboard/stats - dashboard metrics (admin/manager/cashier)
router.get('/stats', getStats);

// Reports (admin/manager)
// GET /api/dashboard/reports/summary
router.get('/reports/summary', authorize(Role.admin, Role.manager), getSummary);

// GET /api/dashboard/reports/category-sales
router.get('/reports/category-sales', authorize(Role.admin, Role.manager), getCategorySalesHandler);

// GET /api/dashboard/reports/best-sellers
router.get('/reports/best-sellers', authorize(Role.admin, Role.manager, Role.cashier), getBestSellersHandler);

export default router;
