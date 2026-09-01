import { Request, Response, NextFunction } from 'express';
import { listUsers, createUser, updateUser, deleteUser } from '../services/auth.service';
import { successResponse } from '../utils/apiResponse';

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await listUsers();
    return successResponse(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

export const createUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, role, password, avatar } = req.body;
    const user = await createUser({ email, name, role, password, avatar });
    return successResponse(res, 201, 'User created successfully', user);
  } catch (error) {
    next(error);
  }
};

export const updateUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { email, name, role, password, avatar, isActive } = req.body;
    const user = await updateUser(id, { email, name, role, password, avatar, isActive });
    return successResponse(res, 200, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
};

export const deleteUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await deleteUser(id);
    return successResponse(res, 200, 'User deleted successfully', result);
  } catch (error) {
    next(error);
  }
};
