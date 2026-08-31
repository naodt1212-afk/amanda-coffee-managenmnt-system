import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { config } from '../config';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';
import { AuthPayload } from '../types';

// Strip sensitive fields before returning to client
export const sanitizeUser = <T extends { passwordHash: string }>(user: T) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const signToken = (payload: AuthPayload): string => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated.', 'ACCOUNT_DEACTIVATED');
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { token, user: sanitizeUser(user) };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, 'User not found.', 'USER_NOT_FOUND');
  }
  return sanitizeUser(user);
};

export const createUser = async (data: {
  email: string;
  name: string;
  role: Role;
  password: string;
  avatar?: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (existing) {
    throw new ApiError(409, 'A user with this email already exists.', 'DUPLICATE_EMAIL');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      name: data.name,
      role: data.role,
      passwordHash,
      avatar: data.avatar,
    },
  });

  return sanitizeUser(user);
};

export const updateUser = async (
  id: string,
  data: {
    email?: string;
    name?: string;
    role?: Role;
    password?: string;
    avatar?: string;
    isActive?: boolean;
  }
) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'User not found.', 'USER_NOT_FOUND');
  }

  const updateData: Record<string, unknown> = {};

  if (data.email) updateData.email = data.email.toLowerCase().trim();
  if (data.name) updateData.name = data.name;
  if (data.role) updateData.role = data.role;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);

  if (data.email) {
    const emailExists = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase().trim(), id: { not: id } },
    });
    if (emailExists) {
      throw new ApiError(409, 'A user with this email already exists.', 'DUPLICATE_EMAIL');
    }
  }

  const user = await prisma.user.update({ where: { id }, data: updateData });
  return sanitizeUser(user);
};

export const deleteUser = async (id: string) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'User not found.', 'USER_NOT_FOUND');
  }
  await prisma.user.delete({ where: { id } });
  return { id };
};

export const listUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return users.map(sanitizeUser);
};
