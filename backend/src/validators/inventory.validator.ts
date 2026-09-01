import { body, param, query } from 'express-validator';

export const inventoryIdParamValidator = [
  param('id').notEmpty().withMessage('Inventory item id is required.'),
];

export const adjustStockValidator = [
  param('id').notEmpty().withMessage('Inventory item id is required.'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required.')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a non-negative number.'),
  body('type')
    .notEmpty().withMessage('Adjustment type is required.')
    .isIn(['in', 'out', 'adjust'])
    .withMessage('Type must be one of: in, out, adjust.'),
  body('note')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Note must be 500 characters or less.'),
];
