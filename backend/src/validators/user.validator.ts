import { body, param } from 'express-validator';
import { Role } from '@prisma/client';

const validRoles = Object.values(Role);

export const createUserValidator = [
  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),
  body('name')
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(validRoles).withMessage(`Role must be one of: ${validRoles.join(', ')}.`),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6, max: 72 }).withMessage('Password must be at least 6 characters.'),
];

export const updateUserValidator = [
  param('id').notEmpty().withMessage('User id is required.'),
  body('email').optional().isEmail().withMessage('Please provide a valid email address.'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  body('role')
    .optional()
    .isIn(validRoles)
    .withMessage(`Role must be one of: ${validRoles.join(', ')}.`),
  body('password')
    .optional()
    .isLength({ min: 6, max: 72 })
    .withMessage('Password must be at least 6 characters.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean.'),
];

export const userIdParamValidator = [
  param('id').notEmpty().withMessage('User id is required.'),
];
