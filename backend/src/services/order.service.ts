import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderSource,
  NotificationType,
  TableStatus,
} from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../middleware/errorHandler';

interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

// Simple numeric order number derived from the DB autoincrement
const buildOrderDisplayId = (orderId: string): string => {
  return orderId.slice(-6).toUpperCase();
};

export const listOrders = async (filters: {
  status?: string;
  search?: string;
  orderSource?: string;
}) => {
  const where: Record<string, unknown> = {};

  if (filters.status && filters.status !== 'all') {
    where.status = filters.status;
  }

  if (filters.orderSource && filters.orderSource !== 'all') {
    where.orderSource = filters.orderSource;
  }

  if (filters.search) {
    const search = filters.search;
    where.OR = [
      { id: { contains: search, mode: 'insensitive' as const } },
      { tableNumber: { contains: search, mode: 'insensitive' as const } },
      { customerName: { contains: search, mode: 'insensitive' as const } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });

  return orders.map(serializeOrder);
};

export const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { menuItem: true },
      },
    },
  });

  if (!order) {
    throw new ApiError(404, 'Order not found.', 'ORDER_NOT_FOUND');
  }

  return serializeOrder(order);
};

// Serialize DB order to frontend-compatible order shape
const serializeOrder = (order: {
  id: string;
  items: Array<{
    id: string;
    itemName: string;
    itemPrice: unknown;
    quantity: number;
    specialInstructions: string | null;
    menuItemId: string | null;
  }>;
} & Record<string, unknown>) => {
  return {
    id: order.id,
    tableId: order.tableId,
    tableNumber: order.tableNumber,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    total: Number(order.total),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    orderSource: order.orderSource,
    customerName: order.customerName,
    items: order.items.map((item) => ({
      id: item.id,
      menuItem: {
        id: item.menuItemId ?? item.menuItemId,
        name: item.itemName,
        price: Number(item.itemPrice),
      },
      quantity: item.quantity,
      specialInstructions: item.specialInstructions,
    })),
  };
};

// Create a customer self-service order (no auth required)
export const createCustomerOrder = async (data: {
  tableId: string;
  customerName?: string;
  items: OrderItemInput[];
}) => {
  return createOrderWithSource(data, OrderSource.customer, 'Guest Customer');
};

// Create a staff order (auth required)
export const createStaffOrder = async (data: {
  tableId: string;
  customerName?: string;
  items: OrderItemInput[];
}) => {
  return createOrderWithSource(data, OrderSource.staff, 'Staff Customer');
};

const createOrderWithSource = async (
  data: {
    tableId: string;
    customerName?: string;
    items: OrderItemInput[];
  },
  source: OrderSource,
  defaultName: string
) => {
  if (!data.tableId) {
    throw new ApiError(400, 'Please allocate a table for this order.', 'TABLE_REQUIRED');
  }
  if (!data.items || data.items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item.', 'EMPTY_ORDER');
  }

  const table = await prisma.diningTable.findUnique({ where: { id: data.tableId } });
  if (!table) {
    throw new ApiError(404, 'Selected table not found.', 'TABLE_NOT_FOUND');
  }

  // Fetch all menu items at once
  const menuItemIds = data.items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

  // Build order items with snapshots, validate availability
  let subtotal = 0;
  const orderItems = data.items.map((i) => {
    const menuItem = menuItemMap.get(i.menuItemId);
    if (!menuItem) {
      throw new ApiError(400, `Menu item not found for id: ${i.menuItemId}`, 'MENU_ITEM_NOT_FOUND');
    }
    if (!menuItem.availability) {
      throw new ApiError(
        400,
        `${menuItem.name} is currently out of stock. Please remove it from your order.`,
        'ITEM_UNAVAILABLE'
      );
    }
    if (i.quantity <= 0) {
      throw new ApiError(400, `Invalid quantity for ${menuItem.name}.`, 'INVALID_QUANTITY');
    }

    subtotal += Number(menuItem.price) * i.quantity;

    return {
      menuItemId: menuItem.id,
      itemName: menuItem.name,
      itemPrice: menuItem.price,
      quantity: i.quantity,
      specialInstructions: i.specialInstructions,
    };
  });

  const order = await prisma.order.create({
    data: {
      tableId: table.id,
      tableNumber: table.number,
      subtotal,
      discount: 0,
      total: subtotal,
      status: OrderStatus.pending,
      paymentStatus: PaymentStatus.unpaid,
      orderSource: source,
      customerName: data.customerName?.trim() || defaultName,
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  });

  // Mark table as occupied
  await prisma.diningTable.update({
    where: { id: table.id },
    data: { status: TableStatus.occupied, currentOrderId: order.id },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      type: NotificationType.new_order,
      title: source === OrderSource.customer ? 'New Customer Order' : 'Staff Placed Order',
      message: `Order #${buildOrderDisplayId(order.id)} logged for ${table.number} - ETB ${Number(order.total)}`,
    },
  });

  return getOrderById(order.id);
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    throw new ApiError(404, 'Order not found.', 'ORDER_NOT_FOUND');
  }

  // Cannot update cancelled/completed orders except through explicit flows
  if (
    existing.status === 'cancelled' ||
    existing.status === 'completed'
  ) {
    throw new ApiError(400, 'This order has already been finalized.', 'ORDER_FINALIZED');
  }

  const validTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    pending: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['served'],
    served: ['completed'],
  };

  const allowed = validTransitions[existing.status];
  if (allowed && !allowed.includes(status)) {
    throw new ApiError(
      400,
      `Cannot transition order from ${existing.status} to ${status}.`,
      'INVALID_STATUS_TRANSITION'
    );
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: true },
  });

  // Fire notification when order becomes ready
  if (status === OrderStatus.ready) {
    await prisma.notification.create({
      data: {
        type: NotificationType.order_ready,
        title: 'Order Ready to Serve',
        message: `Order #${buildOrderDisplayId(order.id)} for ${order.tableNumber} is prepared and ready!`,
      },
    });
  }

  return getOrderById(orderId);
};

// Cancel an order
export const cancelOrder = async (orderId: string) => {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    throw new ApiError(404, 'Order not found.', 'ORDER_NOT_FOUND');
  }

  if (existing.status === 'completed' || existing.status === 'cancelled') {
    throw new ApiError(400, 'This order has already been finalized.', 'ORDER_FINALIZED');
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.cancelled },
    include: { items: true },
  });

  // Free the table
  await prisma.diningTable.update({
    where: { id: existing.tableId },
    data: { status: TableStatus.available, currentOrderId: null },
  });

  return getOrderById(orderId);
};

// Process payment for an order
export const payOrder = async (
  orderId: string,
  data: {
    method: PaymentMethod;
    discount: number;
    amountPaid: number;
  }
) => {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    throw new ApiError(404, 'Order not found.', 'ORDER_NOT_FOUND');
  }

  if (existing.paymentStatus === 'paid') {
    throw new ApiError(400, 'This order has already been paid.', 'ORDER_ALREADY_PAID');
  }

  if (existing.status === 'cancelled') {
    throw new ApiError(400, 'Cannot pay for a cancelled order.', 'ORDER_CANCELLED');
  }

  if (data.discount < 0) {
    throw new ApiError(400, 'Discount cannot be negative.', 'INVALID_DISCOUNT');
  }

  const updatedTotal = Math.max(0, Number(existing.total) - data.discount);

  // For cash payments, verify amount paid is sufficient
  if (data.method === PaymentMethod.cash && data.amountPaid < updatedTotal) {
    throw new ApiError(
      400,
      `Amount paid is less than the bill total! Needs ${updatedTotal} ETB.`,
      'INSUFFICIENT_PAYMENT'
    );
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: PaymentStatus.paid,
      paymentMethod: data.method,
      discount: data.discount,
      total: updatedTotal,
      status: OrderStatus.completed,
    },
    include: { items: true },
  });

  // Free the table
  await prisma.diningTable.update({
    where: { id: existing.tableId },
    data: { status: TableStatus.available, currentOrderId: null },
  });

  // Create payment confirmation notification
  await prisma.notification.create({
    data: {
      type: NotificationType.payment_confirmation,
      title: 'Payment Confirmed',
      message: `Order #${buildOrderDisplayId(order.id)} paid with ${data.method.toUpperCase()} (Total ETB ${updatedTotal})`,
    },
  });

  return getOrderById(order.id);
};

// Add items to an existing order (extends totals)
export const addItemsToOrder = async (orderId: string, extraItems: OrderItemInput[]) => {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!existing) {
    throw new ApiError(404, 'Order not found.', 'ORDER_NOT_FOUND');
  }

  if (existing.status === 'completed' || existing.status === 'cancelled') {
    throw new ApiError(400, 'Cannot add items to a finalized order.', 'ORDER_FINALIZED');
  }

  if (!extraItems || extraItems.length === 0) {
    throw new ApiError(400, 'No items provided to add.', 'EMPTY_ITEMS');
  }

  // Merge with existing items (sum quantities for same menu item)
  const merged = [...existing.items];

  for (const extra of extraItems) {
    const menuItem = await prisma.menuItem.findUnique({ where: { id: extra.menuItemId } });
    if (!menuItem) {
      throw new ApiError(400, `Menu item not found for id: ${extra.menuItemId}`, 'MENU_ITEM_NOT_FOUND');
    }
    if (!menuItem.availability) {
      throw new ApiError(400, `${menuItem.name} is currently out of stock.`, 'ITEM_UNAVAILABLE');
    }

    const matched = merged.find((i) => i.menuItemId === extra.menuItemId);
    if (matched) {
      await prisma.orderItem.update({
        where: { id: matched.id },
        data: { quantity: matched.quantity + extra.quantity },
      });
    } else {
      await prisma.orderItem.create({
        data: {
          orderId,
          menuItemId: menuItem.id,
          itemName: menuItem.name,
          itemPrice: menuItem.price,
          quantity: extra.quantity,
          specialInstructions: extra.specialInstructions,
        },
      });
    }
  }

  // Recalculate subtotal and total
  const updatedItems = await prisma.orderItem.findMany({ where: { orderId } });
  const newSubtotal = updatedItems.reduce(
    (sum, i) => sum + Number(i.itemPrice) * i.quantity,
    0
  );

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      subtotal: newSubtotal,
      total: newSubtotal,
    },
    include: { items: true },
  });

  return getOrderById(order.id);
};
