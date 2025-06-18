import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validation rules for project creation
export const validateProjectCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name is required and must be between 1-100 characters'),
  
  body('key')
    .trim()
    .isLength({ min: 2, max: 10 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Project key must be 2-10 characters, uppercase letters and numbers only'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('visibility')
    .optional()
    .isIn(['Public', 'Private'])
    .withMessage('Visibility must be either Public or Private'),
  
  body('environments')
    .optional()
    .isArray()
    .withMessage('Environments must be an array'),
  
  body('environments.*')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Environment names cannot be empty'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag names must be between 1-50 characters'),
  
  // Settings validation
  body('settings.defaultEnvironment')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Default environment cannot be empty'),
  
  body('settings.testCasePrefix')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Test case prefix must be 1-10 characters, uppercase letters and numbers only'),
  
  body('settings.requiresApproval')
    .optional()
    .isBoolean()
    .withMessage('Requires approval must be a boolean'),
  
  body('settings.automationEnabled')
    .optional()
    .isBoolean()
    .withMessage('Automation enabled must be a boolean'),

  // Validation result handler
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for project updates
export const validateProjectUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1-100 characters'),
  
  body('key')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Project key must be 2-10 characters, uppercase letters and numbers only'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('visibility')
    .optional()
    .isIn(['Public', 'Private'])
    .withMessage('Visibility must be either Public or Private'),
  
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Archived'])
    .withMessage('Status must be Active, Inactive, or Archived'),
  
  body('environments')
    .optional()
    .isArray()
    .withMessage('Environments must be an array'),
  
  body('environments.*')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Environment names cannot be empty'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag names must be between 1-50 characters'),
  
  // Settings validation
  body('settings.defaultEnvironment')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Default environment cannot be empty'),
  
  body('settings.testCasePrefix')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Test case prefix must be 1-10 characters, uppercase letters and numbers only'),
  
  body('settings.requiresApproval')
    .optional()
    .isBoolean()
    .withMessage('Requires approval must be a boolean'),
  
  body('settings.automationEnabled')
    .optional()
    .isBoolean()
    .withMessage('Automation enabled must be a boolean'),

  // Validation result handler
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation for team member operations
export const validateTeamMemberOperation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('role')
    .optional()
    .isIn(['Owner', 'Admin', 'Developer', 'Tester', 'Viewer'])
    .withMessage('Role must be Owner, Admin, Developer, Tester, or Viewer'),

  // Validation result handler
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
]; 