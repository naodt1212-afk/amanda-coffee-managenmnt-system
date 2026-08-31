import { body, param } from 'express-validator';

export const tableIdParamValidator = [
  param('id').notEmpty().withMessage('Table id is required.'),
];

export const tableStatusValidator = [
  param('id').notEmpty().withMessage('Table id is required.'),
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['available', 'occupied'])
    .withMessage('Status must be either "available" or "occupied".'),
  body('currentOrderId')
    .optional()
    .isString()
    .withMessage('currentOrderId must be a string.'),
];
