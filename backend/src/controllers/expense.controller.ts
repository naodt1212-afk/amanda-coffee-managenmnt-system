import { Request, Response, NextFunction } from 'express';
import { listExpenses, createExpense, deleteExpense } from '../services/expense.service';
import { successResponse } from '../utils/apiResponse';

export const getExpenses = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const expenses = await listExpenses();
    return successResponse(res, 200, 'Expenses retrieved successfully', expenses);
  } catch (error) {
    next(error);
  }
};

export const createExpenseHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, amount, description, date } = req.body;
    const expense = await createExpense({ category, amount, description, date });
    return successResponse(res, 201, 'Expense logged successfully', expense);
  } catch (error) {
    next(error);
  }
};

export const deleteExpenseHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await deleteExpense(id);
    return successResponse(res, 200, 'Expense deleted successfully', result);
  } catch (error) {
    next(error);
  }
};
