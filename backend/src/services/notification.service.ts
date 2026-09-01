import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export const listNotifications = async () => {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return notifications;
};

export const markNotificationAsRead = async (id: string) => {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Notification not found.', 'NOTIFICATION_NOT_FOUND');
  }
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
};

export const markAllNotificationsAsRead = async () => {
  await prisma.notification.updateMany({ data: { isRead: true } });
  return { success: true };
};
