import { Request, Response, NextFunction } from 'express';
import {
  listInventory,
  getInventoryItem,
  adjustStock,
  getStockHistory,
} from '../services/inventory.service';
import { successResponse } from '../utils/apiResponse';

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await listInventory();
    return successResponse(res, 200, 'Inventory retrieved successfully', items);
  } catch (error) {
    next(error);
  }
};

export const getInventoryItemHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await getInventoryItem(id);
    return successResponse(res, 200, 'Inventory item retrieved successfully', item);
  } catch (error) {
    next(error);
  }
};

export const adjustStockHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { quantity, type, note } = req.body;
    const item = await adjustStock(id, quantity, type, note ?? 'Manual stock adjustment');
    return successResponse(res, 200, 'Stock updated successfully', item);
  } catch (error) {
    next(error);
  }
};

export const getStockHistoryHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const movements = await getStockHistory();
    return successResponse(res, 200, 'Stock movement history retrieved successfully', movements);
  } catch (error) {
    next(error);
  }
};
