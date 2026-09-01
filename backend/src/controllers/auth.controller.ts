import { Request, Response, NextFunction } from 'express';
import { loginUser, getUserById } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { ApiError } from '../middleware/errorHandler';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new ApiError(401, 'Authentication required.', 'UNAUTHORIZED');
    }
    const user = await getUserById(req.userId);
    return successResponse(res, 200, 'Current user retrieved', user);
  } catch (error) {
    next(error);
  }
};
