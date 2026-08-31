import { Request, Response, NextFunction } from 'express';
import {
  listMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../services/menu.service';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { ApiError } from '../middleware/errorHandler';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, availability } = req.query;
    const items = await listMenuItems({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      availability: typeof availability === 'string' ? availability : undefined,
    });
    return successResponse(res, 200, 'Menu items retrieved successfully', items);
  } catch (error) {
    next(error);
  }
};

export const getMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await getMenuItemById(id);
    return successResponse(res, 200, 'Menu item retrieved successfully', item);
  } catch (error) {
    next(error);
  }
};

export const createMenuItemHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, category, image, availability, preparationTime } = req.body;
    const item = await createMenuItem({
      name,
      description: description ?? '',
      price,
      category,
      image: image ?? '',
      availability: availability ?? true,
      preparationTime,
    });
    return successResponse(res, 201, 'Menu item created successfully', item);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItemHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, availability, preparationTime } = req.body;
    const item = await updateMenuItem(id, {
      name,
      description,
      price,
      category,
      image,
      availability,
      preparationTime,
    });
    return successResponse(res, 200, 'Menu item updated successfully', item);
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItemHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await deleteMenuItem(id);
    return successResponse(res, 200, 'Menu item deleted successfully', result);
  } catch (error) {
    next(error);
  }
};
