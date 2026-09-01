import { Request, Response, NextFunction } from 'express';
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notification.service';
import { successResponse } from '../utils/apiResponse';

export const getNotifications = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await listNotifications();
    return successResponse(res, 200, 'Notifications retrieved successfully', notifications);
  } catch (error) {
    next(error);
  }
};

export const markReadHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const notification = await markNotificationAsRead(id);
    return successResponse(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

export const markAllReadHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await markAllNotificationsAsRead();
    return successResponse(res, 200, 'All notifications marked as read', { success: true });
  } catch (error) {
    next(error);
  }
};
