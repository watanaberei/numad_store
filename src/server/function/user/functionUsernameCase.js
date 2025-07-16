///////////////////////// START USERNAME CASE FIX /////////////////////////
// scripts/fixUsernameCase.js - Standardize usernames to lowercase

import dotenv from 'dotenv';
import { connectDB, UserModel } from '../src/data/mongodb/mongodb.js';

dotenv.config();

async function fixUsernameCase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Find all users with non-lowercase usernames
    const users = await UserModel.find({
      username: { $regex: /[A-Z]/ }
    });
    
    console.log(`Found ${users.length} users with uppercase letters in username`);
    
    for (const user of users) {
      const oldUsername = user.username;
      const newUsername = user.username.toLowerCase();
      
      // Check if lowercase version already exists
      const existingUser = await UserModel.findOne({ 
        username: newUsername,
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        console.log(`WARNING: Cannot change ${oldUsername} to ${newUsername} - username already exists`);
        continue;
      }
      
      // Update username to lowercase
      user.username = newUsername;
      await user.save();
      
      console.log(`Updated: ${oldUsername} -> ${newUsername}`);
    }
    
    console.log('Username case fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixUsernameCase();
}

export default fixUsernameCase;

///////////////////////// END USERNAME CASE FIX /////////////////////////

///////////////////////// START TEMPORARY FIX /////////////////////////
// Alternative: Just update the single user for now
// Run this in MongoDB shell:

/*
db.users.updateOne(
  { username: "Neumad" },
  { $set: { username: "neumad" } }
)
*/

///////////////////////// END TEMPORARY FIX /////////////////////////