import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

// Custom API error class with status code and error code
export class ApiError extends Error {
  public statusCode: number;
  public errorCode: string;
  public errors?: unknown;

  constructor(statusCode: number, message: string, errorCode: string, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    error: 'NOT_FOUND',
  });
};

// Central error handler
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // If it's our custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'A record with this unique value already exists.',
          error: 'DUPLICATE_RECORD',
          errors: err.meta,
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'The requested record was not found.',
          error: 'RECORD_NOT_FOUND',
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          message: 'Related record does not exist. Check foreign key references.',
          error: 'FOREIGN_KEY_VIOLATION',
          errors: err.meta,
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'A database error occurred.',
          error: 'DATABASE_ERROR',
          errors: err.meta,
        });
    }
  }

  // Prisma validation error (data too long, wrong type, etc.)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Data validation failed on the database layer.',
      error: 'VALIDATION_ERROR',
    });
  }

  // JSON parse errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
      error: 'INVALID_JSON',
    });
  }

  // Fallback internal server error
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
    error: 'INTERNAL_SERVER_ERROR',
  });
};
