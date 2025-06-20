import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';
import { cacheService } from '../services/cacheService';

interface LoginRequest {
  email: string;
  password: string;
  tenantId?: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'admin' | 'qa' | 'developer' | 'viewer';
  tenantId?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    tenantId: string;
    isActive: boolean;
  };
  token?: string;
  refreshToken?: string;
}

export class AuthController {
  /**
   * User login
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, tenantId }: LoginRequest = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        } as AuthResponse);
        return;
      }

      // For development, check if we need to create default users
      if (process.env.NODE_ENV === 'development' && process.env.CREATE_TEST_USERS === 'true') {
        await this.ensureTestUsersExist(tenantId || 'dev');
      }

      // Find user by email and tenant
      const query: any = { email: email.toLowerCase() };
      if (tenantId) {
        query.tenantId = tenantId;
      } else {
        query.tenantId = process.env.DEFAULT_TENANT || 'dev';
      }

      const user = await User.findOne(query) as IUser;

      if (!user) {
        logger.warn(`Login attempt for non-existent user: ${email}`);
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        } as AuthResponse);
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact your administrator.'
        } as AuthResponse);
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        logger.warn(`Invalid password attempt for user: ${email}`);
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        } as AuthResponse);
        return;
      }

      // Generate JWT tokens
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      };

      const token = (jwt as any).sign(
        tokenPayload,
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const refreshToken = (jwt as any).sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      // Update last login
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
        $inc: { loginCount: 1 }
      });

      // Cache user session (if Redis is available)
      await cacheService.set(`user_session:${user._id}`, {
        userId: user._id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        lastLogin: new Date()
      }, { ttl: 86400 }); // 24 hours

      logger.info(`Successful login for user: ${email}, tenant: ${user.tenantId}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          isActive: user.isActive
        },
        token,
        refreshToken
      } as AuthResponse);
      return;

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'An internal server error occurred during login'
      } as AuthResponse);
      return;
    }
  }

  /**
   * User registration (for self-registration if enabled)
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, password, role, tenantId }: RegisterRequest = req.body;

      // Validate input
      if (!firstName || !lastName || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'All fields are required'
        } as AuthResponse);
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        tenantId: tenantId || process.env.DEFAULT_TENANT || 'dev'
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        } as AuthResponse);
        return;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'viewer',
        tenantId: tenantId || process.env.DEFAULT_TENANT || 'dev',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await user.save();

      logger.info(`New user registered: ${email}, tenant: ${user.tenantId}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully'
      } as AuthResponse);
      return;

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'An internal server error occurred during registration'
      } as AuthResponse);
      return;
    }
  }

  /**
   * Refresh JWT token
   */
  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        } as AuthResponse);
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // Find user
      const user = await User.findById(decoded.userId) as IUser;
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        } as AuthResponse);
        return;
      }

      // Generate new access token
      const token = (jwt as any).sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          tenantId: user.tenantId
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        token
      } as AuthResponse);
      return;

    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      } as AuthResponse);
      return;
    }
  }

  /**
   * User logout
   */
  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (userId) {
        // Clear cached session
        await cacheService.del(`user_session:${userId}`);
        logger.info(`User logged out: ${userId}`);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      } as AuthResponse);
      return;

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during logout'
      } as AuthResponse);
      return;
    }
  }

  /**
   * Get current user profile
   */
  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        } as AuthResponse);
        return;
      }

      const user = await User.findById(userId).select('-password') as IUser;

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as AuthResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        user: {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          isActive: user.isActive
        }
      } as AuthResponse);
      return;

    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving profile'
      } as AuthResponse);
      return;
    }
  }

  /**
   * Ensure test users exist for development
   */
  private async ensureTestUsersExist(tenantId: string): Promise<void> {
    try {
      const testUsers = [
        {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@tcmanager.com',
          password: 'admin123!',
          role: 'admin' as const
        },
        {
          firstName: 'QA',
          lastName: 'Tester',
          email: 'qa@tcmanager.com',
          password: 'qa123!',
          role: 'qa' as const
        },
        {
          firstName: 'Developer',
          lastName: 'User',
          email: 'dev@tcmanager.com',
          password: 'dev123!',
          role: 'developer' as const
        }
      ];

      for (const testUser of testUsers) {
        const existingUser = await User.findOne({ 
          email: testUser.email,
          tenantId 
        });

        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(testUser.password, 12);
          
          const user = new User({
            ...testUser,
            password: hashedPassword,
            tenantId,
            isActive: true,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          await user.save();
          logger.info(`Created test user: ${testUser.email} for tenant: ${tenantId}`);
        }
      }
    } catch (error) {
      logger.error('Error creating test users:', error);
    }
  }
} 