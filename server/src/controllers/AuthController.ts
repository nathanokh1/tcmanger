import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role = 'viewer' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ 
          message: 'User already exists with this email' 
        });
        return;
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role,
        isEmailVerified: true // Auto-verify for demo
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '24h' }
      );

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ 
        message: 'Registration failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        res.status(401).json({ 
          message: 'Invalid email or password' 
        });
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ 
          message: 'Invalid email or password' 
        });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '24h' }
      );

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          preferences: user.preferences
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ 
        message: 'Login failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return;
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // For JWT, logout is handled client-side by removing the token
    res.json({ message: 'Logout successful' });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(401).json({ message: 'Token required' });
        return;
      }

      // Verify existing token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        res.status(401).json({ message: 'Invalid token' });
        return;
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Token refreshed successfully',
        token: newToken
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({ message: 'Token refresh failed' });
      return;
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({ message: 'Failed to get profile' });
      return;
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { firstName, lastName, preferences } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, preferences },
        { new: true, runValidators: true }
      );

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          preferences: user.preferences
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
      return;
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
      return;
    }
  }
} 