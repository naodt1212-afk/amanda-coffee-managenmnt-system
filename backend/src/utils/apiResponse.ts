import { Response } from 'express';

// Consistent success response wrapper
export const successResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: unknown = null,
  meta?: unknown
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};

// Consistent error response wrapper
export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  error: string,
  errors?: unknown
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
    ...(errors ? { errors } : {}),
  });
};
