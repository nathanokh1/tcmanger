import mongoose from 'mongoose';
import { User } from '../models/User';
import { logger } from './logger';

export async function createSpecificUser(): Promise<void> {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tcmanager';
      await mongoose.connect(mongoURI);
      logger.info('Connected to MongoDB for user creation');
    }

    logger.info('Creating user account for nrmokh@gmail.com...');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'nrmokh@gmail.com' });
    
    if (existingUser) {
      logger.info('⚠️  User already exists. Updating password...');
      existingUser.password = 'Random1234!';
      existingUser.isActive = true;
      existingUser.isEmailVerified = true;
      await existingUser.save();
      logger.info('✅ User password updated successfully!');
    } else {
      // Create new user
      const user = new User({
        email: 'nrmokh@gmail.com',
        password: 'Random1234!',
        firstName: 'User',
        lastName: 'Account',
        role: 'admin', // Give admin access
        isEmailVerified: true,
        isActive: true,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      });

      await user.save();
      logger.info('✅ Created new user: nrmokh@gmail.com (admin)');
    }

    // Optional: Clear demo data (projects, test cases, etc.)
    logger.info('Clearing any demo data...');
    
    // Import models for cleanup
    const { Project } = await import('../models/Project');
    const { TestCase } = await import('../models/TestCase');
    
    // Clear demo projects and test cases
    await Project.deleteMany({});
    await TestCase.deleteMany({});
    
    logger.info('✅ Demo data cleared');

    // Log successful creation
    const user = await User.findOne({ email: 'nrmokh@gmail.com' }, { password: 0 });
    logger.info('📋 User created:');
    logger.info(`   - ${user?.email} (${user?.role})`);
    logger.info('🔑 Login credentials: nrmokh@gmail.com / Random1234!');

  } catch (error) {
    logger.error('❌ Error creating user:', error);
    throw error;
  }
}

// Standalone execution
export async function runCreateUser(): Promise<void> {
  try {
    await createSpecificUser();

    // Close connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');

    process.exit(0);
  } catch (error) {
    logger.error('User creation failed:', error);
    process.exit(1);
  }
}

// Allow direct execution
if (require.main === module) {
  runCreateUser();
} 