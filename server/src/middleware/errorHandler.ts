import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { statusCode = 500, message, stack } = err;
  
  // Log error details
  logger.error('Error occurred:', {
    error: message,
    statusCode,
    stack: stack || 'No stack trace available',
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't expose sensitive error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    success: false,
    error: {
      message: isDevelopment ? message : 'Internal Server Error',
      statusCode,
      ...(isDevelopment && { stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.url,
  };

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  res.status(404).json({
    success: false,
    error: {
      message: error.message,
      statusCode: 404,
    },
    timestamp: new Date().toISOString(),
    path: req.url,
  });
};

// Async error wrapper to catch async function errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 