import mongoose from 'mongoose';
import { User } from '../models/User';
import { logger } from './logger';

export async function fixTestAccounts(): Promise<void> {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tcmanager';
      await mongoose.connect(mongoURI);
      logger.info('Connected to MongoDB for fixing test accounts');
    }

    logger.info('Fixing test accounts...');

    const testAccounts = [
      {
        email: 'admin@tcmanager.com',
        password: 'AdminPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin' as const
      },
      {
        email: 'developer@tcmanager.com', 
        password: 'DevPassword123!',
        firstName: 'John',
        lastName: 'Developer',
        role: 'developer' as const
      },
      {
        email: 'qa@tcmanager.com',
        password: 'QAPassword123!',
        firstName: 'Jane',
        lastName: 'Tester',
        role: 'qa' as const
      },
      {
        email: 'viewer@tcmanager.com',
        password: 'ViewPassword123!',
        firstName: 'Bob',
        lastName: 'Viewer',
        role: 'viewer' as const
      }
    ];

    for (const accountData of testAccounts) {
      // Check if user exists
      let user = await User.findOne({ email: accountData.email });
      
      if (user) {
        logger.info(`⚠️  Updating existing user: ${accountData.email}`);
        // Update existing user
        user.password = accountData.password; // This will trigger password hashing
        user.firstName = accountData.firstName;
        user.lastName = accountData.lastName;
        user.role = accountData.role;
        user.isActive = true;
        user.isEmailVerified = true;
        await user.save();
        logger.info(`✅ Updated user: ${accountData.email} (${accountData.role})`);
      } else {
        // Create new user
        user = new User({
          ...accountData,
          isEmailVerified: true,
          isActive: true,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        });

        await user.save();
        logger.info(`✅ Created user: ${accountData.email} (${accountData.role})`);
      }
    }

    logger.info('✅ Test accounts fixed successfully!');
    
    // Log all test accounts
    logger.info('📋 Available test accounts:');
    for (const account of testAccounts) {
      logger.info(`   - ${account.email} / ${account.password} (${account.role})`);
    }

  } catch (error) {
    logger.error('❌ Error fixing test accounts:', error);
    throw error;
  }
}

// Standalone execution
export async function runFixTestAccounts(): Promise<void> {
  try {
    await fixTestAccounts();

    // Close connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');

    process.exit(0);
  } catch (error) {
    logger.error('Fixing test accounts failed:', error);
    process.exit(1);
  }
}

// Allow direct execution
if (require.main === module) {
  runFixTestAccounts();
} 