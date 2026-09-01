import { TableStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

export const listTables = async () => {
  const tables = await prisma.diningTable.findMany({
    orderBy: { number: 'asc' },
  });
  return tables;
};

export const getTableById = async (id: string) => {
  const table = await prisma.diningTable.findUnique({ where: { id } });
  if (!table) {
    throw new ApiError(404, 'Table not found.', 'TABLE_NOT_FOUND');
  }
  return table;
};

export const updateTableStatus = async (
  id: string,
  status: TableStatus,
  currentOrderId?: string
) => {
  const existing = await prisma.diningTable.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Table not found.', 'TABLE_NOT_FOUND');
  }

  const table = await prisma.diningTable.update({
    where: { id },
    data: {
      status,
      currentOrderId: currentOrderId ?? undefined,
    },
  });

  return table;
};
