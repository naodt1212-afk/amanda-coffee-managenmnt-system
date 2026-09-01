import { Request, Response, NextFunction } from 'express';
import { listTables, getTableById, updateTableStatus } from '../services/table.service';
import { successResponse } from '../utils/apiResponse';

export const getTables = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tables = await listTables();
    return successResponse(res, 200, 'Tables retrieved successfully', tables);
  } catch (error) {
    next(error);
  }
};

export const getTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const table = await getTableById(id);
    return successResponse(res, 200, 'Table retrieved successfully', table);
  } catch (error) {
    next(error);
  }
};

export const updateTableStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, currentOrderId } = req.body;
    const table = await updateTableStatus(id, status, currentOrderId);
    return successResponse(res, 200, 'Table status updated successfully', table);
  } catch (error) {
    next(error);
  }
};
