import mongoose from 'mongoose';
import { User } from '../models/User';
import { logger } from './logger';

export interface DefaultUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'qa' | 'developer' | 'viewer';
}

export const defaultUsers: DefaultUser[] = [
  {
    email: 'admin@tcmanager.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    email: 'developer@tcmanager.com', 
    password: 'Dev123!',
    firstName: 'John',
    lastName: 'Developer',
    role: 'developer'
  },
  {
    email: 'qa@tcmanager.com',
    password: 'QA123!',
    firstName: 'Jane',
    lastName: 'Tester',
    role: 'qa'
  },
  {
    email: 'viewer@tcmanager.com',
    password: 'View123!',
    firstName: 'Bob',
    lastName: 'Viewer',
    role: 'viewer'
  }
];

export async function seedUsers(): Promise<void> {
  try {
    logger.info('Starting user seed process...');

    // Check if users already exist
    const existingUserCount = await User.countDocuments();
    if (existingUserCount > 0) {
      logger.info(`Found ${existingUserCount} existing users. Skipping seed.`);
      return;
    }

    logger.info('No existing users found. Creating default users...');

    // Create default users
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User({
          ...userData,
          isEmailVerified: true,
          isActive: true,
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        });

        await user.save();
        logger.info(`✅ Created user: ${userData.email} (${userData.role})`);
      } else {
        logger.info(`⚠️  User already exists: ${userData.email}`);
      }
    }

    logger.info('✅ User seeding completed successfully!');
    
    // Log all created users (without passwords)
    const users = await User.find({}, { password: 0 });
    logger.info('📋 Available users:');
    users.forEach(user => {
      logger.info(`   - ${user.email} (${user.role})`);
    });

  } catch (error) {
    logger.error('❌ Error seeding users:', error);
    throw error;
  }
}

// Standalone execution for manual seeding
export async function runSeedUsers(): Promise<void> {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tcmanager';
      await mongoose.connect(mongoURI);
      logger.info('Connected to MongoDB for seeding');
    }

    await seedUsers();

    // Close connection if we opened it
    if (process.env.NODE_ENV !== 'production') {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Allow direct execution: npm run seed:users
if (require.main === module) {
  runSeedUsers();
} 