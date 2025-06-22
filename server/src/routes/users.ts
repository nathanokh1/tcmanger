import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to check admin permissions
const requireAdmin = async (req: any, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'instance_admin')) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    logger.error('Admin authorization error:', error);
    return res.status(500).json({ message: 'Authorization check failed' });
  }
};

// Get all users in the tenant (admin only)
router.get('/', auth, requireAdmin, async (req: any, res: Response): Promise<void> => {
  try {
    const tenantId = req.user.tenantId;
    
    const users = await User.find({ tenantId })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
    return;
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

// Get current user profile
router.get('/profile', auth, async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
    return;
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

// Create/Invite new user (admin only)
router.post('/invite', auth, requireAdmin, async (req: any, res: Response): Promise<void> => {
  try {
    const { email, firstName, lastName, role } = req.body;
    const tenantId = req.user.tenantId;
    const invitedBy = req.user.id;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'viewer',
      tenantId,
      invitedBy,
      isActive: true,
      mustChangePassword: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    // TODO: Send invitation email with temporary password
    logger.info(`User invited: ${email} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'User invited successfully',
      data: userResponse,
      tempPassword // In production, this would be sent via email only
    });
    return;
  } catch (error) {
    logger.error('Error inviting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invite user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

// Update user (admin or self)
router.put('/:id', auth, async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, isActive } = req.body;
    const currentUser = req.user;

    // Check permissions: admin can update anyone, users can update themselves (limited fields)
    const targetUser = await User.findById(id);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user belongs to same tenant
    if (targetUser.tenantId !== currentUser.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'instance_admin';
    const isSelf = currentUser.id === id;

    if (!isAdmin && !isSelf) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    // Build update object based on permissions
    const updateData: any = {
      updatedAt: new Date()
    };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    // Only admins can change role and status
    if (isAdmin) {
      if (role) updateData.role = role;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
    return;
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

// Delete user (admin only)
router.delete('/:id', auth, requireAdmin, async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Prevent self-deletion
    if (currentUser.id === id) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user belongs to same tenant
    if (user.tenantId !== currentUser.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    await User.findByIdAndDelete(id);
    
    logger.info(`User deleted: ${user.email} by ${currentUser.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    return;
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

// Toggle user status (admin only)
router.patch('/:id/toggle-status', auth, requireAdmin, async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Prevent self-status change
    if (currentUser.id === id) {
      res.status(400).json({
        success: false,
        message: 'Cannot change your own status'
      });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user belongs to same tenant
    if (user.tenantId !== currentUser.tenantId) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        isActive: !user.isActive,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    logger.info(`User status toggled: ${user.email} -> ${!user.isActive} by ${currentUser.email}`);

    res.json({
      success: true,
      message: `User ${updatedUser?.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser
    });
    return;
  } catch (error) {
    logger.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

// Get user statistics (admin only)
router.get('/stats', auth, requireAdmin, async (req: any, res: Response): Promise<void> => {
  try {
    const tenantId = req.user.tenantId;
    
    const totalUsers = await User.countDocuments({ tenantId });
    const activeUsers = await User.countDocuments({ tenantId, isActive: true });
    const roleBreakdown = await User.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const recentUsers = await User.find({ tenantId })
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleBreakdown,
        recentUsers
      }
    });
    return;
  } catch (error) {
    logger.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

export { router as userRoutes }; 