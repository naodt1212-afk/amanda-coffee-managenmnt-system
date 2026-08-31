import { body, param } from 'express-validator';
import { Category } from '@prisma/client';

export const createMenuItemValidator = [
  body('name')
    .notEmpty().withMessage('Recipe title is required.')
    .isLength({ min: 1, max: 200 }).withMessage('Name must be 200 characters or less.'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must be 1000 characters or less.'),
  body('price')
    .notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('category')
    .notEmpty().withMessage('Category is required.')
    .isIn(['Coffee', 'Tea', 'Juice', 'Food', 'Soft Drinks', 'Soft_Drinks'])
    .withMessage('Category must be one of: Coffee, Tea, Juice, Food, Soft Drinks.'),
  body('image')
    .optional()
    .isLength({ max: 1000 }).withMessage('Image URL must be 1000 characters or less.'),
  body('availability')
    .optional()
    .isBoolean()
    .withMessage('Availability must be a boolean.'),
  body('preparationTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a non-negative integer.'),
];

export const updateMenuItemValidator = [
  param('id').notEmpty().withMessage('Menu item id is required.'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 200 }).withMessage('Name must be 200 characters or less.'),
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Description must be 1000 characters or less.'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('category')
    .optional()
    .isIn(['Coffee', 'Tea', 'Juice', 'Food', 'Soft Drinks', 'Soft_Drinks'])
    .withMessage('Category must be one of: Coffee, Tea, Juice, Food, Soft Drinks.'),
  body('image')
    .optional()
    .isLength({ max: 1000 }).withMessage('Image URL must be 1000 characters or less.'),
  body('availability')
    .optional()
    .isBoolean()
    .withMessage('Availability must be a boolean.'),
  body('preparationTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a non-negative integer.'),
];

export const menuItemIdParamValidator = [
  param('id').notEmpty().withMessage('Menu item id is required.'),
];
