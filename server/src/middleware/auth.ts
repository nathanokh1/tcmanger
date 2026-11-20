import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { getJwtSecret } from '../utils/jwtSecret';

interface AuthRequest extends Request {
  user?: {
    id: string;
    _id: string;
    email: string;
    role: string;
    tenantId: string;
    firstName: string;
    lastName: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret) as { id?: string; userId?: string };
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid token or user is inactive.'
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
    return;
  }
};

// Legacy export for backwards compatibility
export const authMiddleware = auth; 