import { body } from 'express-validator';

export const updateSettingsValidator = [
  body('shopName')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Shop name must be 100 characters or less.'),
  body('address')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Address must be 200 characters or less.'),
  body('tablesCount')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Tables count must be between 1 and 100.'),
  body('taxPercent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax percent must be between 0 and 100.'),
  body('servicePercent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Service percent must be between 0 and 100.'),
  body('autoPrintReceipt')
    .optional()
    .isBoolean()
    .withMessage('autoPrintReceipt must be a boolean.'),
];
