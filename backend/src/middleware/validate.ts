import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse';

// Middleware to check express-validator results and return errors if any
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.msg ? getFieldError(err) : 'unknown',
      message: err.msg,
    }));
    return errorResponse(res, 400, 'Validation failed.', 'VALIDATION_ERROR', formattedErrors);
  }

  return next();
};

// Extract the field name from the error object (express-validator structure)
const getFieldError = (err: { msg: string; path?: string; param?: string }) => {
  return err.path || err.param || 'unknown';
};
