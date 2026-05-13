/**
 * Migration script to add usernames to existing users
 * 
 * This script generates usernames from email addresses for users who don't have a username.
 * Run this script after adding the username field to the User schema.
 * 
 * Usage:
 *   npx ts-node scripts/migrate-usernames.ts
 * 
 * Or compile and run:
 *   npm run build
 *   node dist/scripts/migrate-usernames.js
 */

import * as mongoose from 'mongoose';
import { UserSchema } from '../src/modules/users/schemas/user.schema';

// Connect to MongoDB (update connection string as needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/survivor';

async function migrateUsernames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get User model
    const User = mongoose.model('User', UserSchema);

    // Find all users without username
    const usersWithoutUsername = await User.find({
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' },
      ],
    });

    console.log(`Found ${usersWithoutUsername.length} users without username`);

    if (usersWithoutUsername.length === 0) {
      console.log('No users to migrate');
      await mongoose.disconnect();
      return;
    }

    // Generate usernames for each user
    for (const user of usersWithoutUsername) {
      const email = user.email;
      let baseUsername = email.split('@')[0].toLowerCase();
      
      // Clean username: remove invalid characters, keep only alphanumeric, underscore, hyphen
      baseUsername = baseUsername.replace(/[^a-z0-9_-]/g, '');
      
      // Ensure minimum length
      if (baseUsername.length < 3) {
        baseUsername = baseUsername.padEnd(3, '0');
      }
      
      // Ensure maximum length
      if (baseUsername.length > 30) {
        baseUsername = baseUsername.substring(0, 30);
      }

      // Check if username is already taken
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        const suffix = counter.toString();
        const maxLength = 30 - suffix.length;
        username = baseUsername.substring(0, maxLength) + suffix;
        counter++;
      }

      // Update user with generated username
      user.username = username;
      await user.save();
      
      console.log(`Updated user ${email} with username: ${username}`);
    }

    console.log('Migration completed successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run migration
migrateUsernames();
