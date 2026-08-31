import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload } from '../types';
import { errorResponse } from '../utils/apiResponse';
import { Role } from '@prisma/client';

// Verifies the JWT and attaches user info to the request
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'Authentication required. Please login.', 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 401, 'Authentication token missing.', 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload & { exp?: number };

    // Check token expiry explicitly
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return errorResponse(res, 401, 'Token has expired. Please login again.', 'TOKEN_EXPIRED');
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return errorResponse(res, 401, 'Token has expired. Please login again.', 'TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return errorResponse(res, 401, 'Invalid authentication token.', 'INVALID_TOKEN');
    }
    return errorResponse(res, 401, 'Authentication failed.', 'UNAUTHORIZED');
  }
};

// Restricts access to specific roles
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return errorResponse(res, 401, 'Authentication required.', 'UNAUTHORIZED');
    }

    if (!roles.includes(req.userRole)) {
      return errorResponse(res, 403, 'You do not have permission to perform this action.', 'FORBIDDEN');
    }

    return next();
  };
};
