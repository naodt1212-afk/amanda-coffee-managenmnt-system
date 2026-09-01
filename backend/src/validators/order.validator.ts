import { body, param } from 'express-validator';

export const orderIdParamValidator = [
  param('id').notEmpty().withMessage('Order id is required.'),
];

export const createOrderValidator = [
  body('tableId')
    .notEmpty().withMessage('Table selection is required.'),
  body('customerName')
    .optional()
    .isString()
    .withMessage('Customer name must be a string.')
    .isLength({ max: 100 })
    .withMessage('Customer name must be 100 characters or less.'),
  body('items')
    .notEmpty().withMessage('Order must contain at least one item.')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item.'),
  body('items.*.menuItemId')
    .notEmpty().withMessage('Menu item id is required for each item.'),
  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required for each item.')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1.'),
  body('items.*.specialInstructions')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Special instructions must be 500 characters or less.'),
];

export const updateOrderStatusValidator = [
  param('id').notEmpty().withMessage('Order id is required.'),
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, preparing, ready, served, completed, cancelled.'),
];

export const payOrderValidator = [
  param('id').notEmpty().withMessage('Order id is required.'),
  body('method')
    .notEmpty().withMessage('Payment method is required.')
    .isIn(['cash', 'telebirr', 'other'])
    .withMessage('Payment method must be one of: cash, telebirr, other.'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number.'),
  body('amountPaid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount paid must be a non-negative number.'),
];

export const addItemsValidator = [
  param('id').notEmpty().withMessage('Order id is required.'),
  body('items')
    .notEmpty().withMessage('Items are required.')
    .isArray({ min: 1 })
    .withMessage('At least one item is required.'),
  body('items.*.menuItemId')
    .notEmpty().withMessage('Menu item id is required for each item.'),
  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required for each item.')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1.'),
];
