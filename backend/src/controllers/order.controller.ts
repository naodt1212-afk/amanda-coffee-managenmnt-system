import { Request, Response, NextFunction } from 'express';
import {
  listOrders,
  getOrderById,
  createCustomerOrder,
  createStaffOrder,
  updateOrderStatus,
  cancelOrder,
  payOrder,
  addItemsToOrder,
} from '../services/order.service';
import { successResponse } from '../utils/apiResponse';

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search, orderSource } = req.query;
    const orders = await listOrders({
      status: typeof status === 'string' ? status : undefined,
      search: typeof search === 'string' ? search : undefined,
      orderSource: typeof orderSource === 'string' ? orderSource : undefined,
    });
    return successResponse(res, 200, 'Orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);
    return successResponse(res, 200, 'Order retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

export const createCustomerOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId, customerName, items } = req.body;
    const order = await createCustomerOrder({ tableId, customerName, items });
    return successResponse(res, 201, 'Order placed successfully! Sending to kitchen...', order);
  } catch (error) {
    next(error);
  }
};

export const createStaffOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId, customerName, items } = req.body;
    const order = await createStaffOrder({ tableId, customerName, items });
    return successResponse(res, 201, 'Order logged successfully', order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await updateOrderStatus(id, status);
    return successResponse(res, 200, `Order status updated to ${status}`, order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await cancelOrder(id);
    return successResponse(res, 200, 'Order cancelled successfully', order);
  } catch (error) {
    next(error);
  }
};

export const payOrderHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { method, discount, amountPaid } = req.body;
    const order = await payOrder(id, { method, discount: discount ?? 0, amountPaid: amountPaid ?? 0 });
    return successResponse(res, 200, 'Payment processed successfully! Receipt generated.', order);
  } catch (error) {
    next(error);
  }
};

export const addItemsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    const order = await addItemsToOrder(id, items);
    return successResponse(res, 200, 'Items added to order successfully', order);
  } catch (error) {
    next(error);
  }
};
