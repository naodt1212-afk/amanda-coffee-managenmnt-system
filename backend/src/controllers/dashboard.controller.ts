import { Request, Response, NextFunction } from 'express';
import { getDashboardStats, getReportSummary, getCategorySales, getBestSellers } from '../services/dashboard.service';
import { successResponse } from '../utils/apiResponse';

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStats();
    return successResponse(res, 200, 'Dashboard statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query;
    const summary = await getReportSummary(
      typeof from === 'string' ? from : undefined,
      typeof to === 'string' ? to : undefined
    );
    return successResponse(res, 200, 'Report summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
};

export const getCategorySalesHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sales = await getCategorySales();
    return successResponse(res, 200, 'Category sales retrieved successfully', sales);
  } catch (error) {
    next(error);
  }
};

export const getBestSellersHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const bestSellers = await getBestSellers();
    return successResponse(res, 200, 'Best sellers retrieved successfully', bestSellers);
  } catch (error) {
    next(error);
  }
};
