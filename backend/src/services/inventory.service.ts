import { InventoryStatus, StockMovementType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

const computeStockStatus = (currentStock: number, minStock: number): InventoryStatus => {
  if (currentStock <= 0) return InventoryStatus.out_of_stock;
  if (currentStock <= minStock / 2) return InventoryStatus.critical;
  if (currentStock <= minStock) return InventoryStatus.low_stock;
  return InventoryStatus.in_stock;
};

export const listInventory = async () => {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: 'asc' },
  });
  return items.map((item) => ({
    ...item,
    lastUpdated: item.lastUpdated,
  }));
};

export const getInventoryItem = async (id: string) => {
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) {
    throw new ApiError(404, 'Inventory item not found.', 'INVENTORY_ITEM_NOT_FOUND');
  }
  return item;
};

export const adjustStock = async (
  itemId: string,
  quantity: number,
  type: StockMovementType,
  note: string
) => {
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) {
    throw new ApiError(404, 'Inventory item not found.', 'INVENTORY_ITEM_NOT_FOUND');
  }

  let newStock = item.currentStock;

  switch (type) {
    case StockMovementType.in:
      newStock = item.currentStock + quantity;
      break;
    case StockMovementType.out:
      newStock = Math.max(0, item.currentStock - quantity);
      break;
    case StockMovementType.adjust:
      newStock = quantity;
      break;
  }

  const status = computeStockStatus(newStock, item.minStock);

  const updatedItem = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      currentStock: newStock,
      status,
      lastUpdated: new Date(),
    },
  });

  // Create stock movement log
  await prisma.stockMovement.create({
    data: {
      itemId,
      itemName: item.name,
      type,
      quantity,
      note: note || 'Manual stock adjustment',
      timestamp: new Date(),
    },
  });

  // Fire critical/low stock notification
  if (status === InventoryStatus.critical || status === InventoryStatus.out_of_stock) {
    await prisma.notification.create({
      data: {
        type: 'low_stock' as const,
        title: 'Critical Stock Alert!',
        message: `${item.name} is extremely low (${newStock} ${item.unit} remaining). Restock immediately!`,
      },
    });
  }

  return updatedItem;
};

export const getStockHistory = async () => {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { timestamp: 'desc' },
  });
  return movements.map((m) => ({
    id: m.id,
    itemId: m.itemId,
    itemName: m.itemName,
    type: m.type,
    quantity: m.quantity,
    note: m.note,
    timestamp: m.timestamp,
  }));
};
