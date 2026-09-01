import { body } from 'express-validator';

export const createExpenseValidator = [
  body('category')
    .notEmpty().withMessage('Expense category is required.')
    .isLength({ max: 100 })
    .withMessage('Category must be 100 characters or less.'),
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number.'),
  body('description')
    .notEmpty().withMessage('Description is required.')
    .isLength({ max: 500 })
    .withMessage('Description must be 500 characters or less.'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601()
    .withMessage('Date must be a valid ISO date.'),
];
