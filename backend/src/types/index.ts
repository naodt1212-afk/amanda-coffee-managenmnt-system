import { Role } from '@prisma/client';

// Decoded JWT payload attached to requests via auth middleware
export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: Role;
      userEmail?: string;
    }
  }
}
