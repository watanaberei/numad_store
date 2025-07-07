///////////////////////// START TEST CONNECTION SCRIPT /////////////////////////
// testConnection.js - Test MongoDB connection and environment variables

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple paths for .env file
const envPaths = [
  path.join(__dirname, '../../../../.env'),
  path.join(__dirname, '../../../.env'),
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../.env'),
  path.join(__dirname, '.env'),
  path.join(process.cwd(), '.env')
];

console.log('=== ENVIRONMENT VARIABLE TEST ===\n');
console.log('Current directory:', __dirname);
console.log('Process directory:', process.cwd());

// Try to find and load .env file
let envLoaded = false;
for (const envPath of envPaths) {
  console.log(`\nTrying to load .env from: ${envPath}`);
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log('✅ Successfully loaded .env file!');
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.log('\n❌ Could not find .env file in any expected location');
  console.log('\nPlease create a .env file in your project root with:');
  console.log('MONGODB_URI=mongodb+srv://user:sshkey@cluster0.bgd0ike.mongodb.net/neumad');
}

// Test environment variables
console.log('\n=== ENVIRONMENT VARIABLES ===');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');

if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI preview:', process.env.MONGODB_URI.substring(0, 30) + '...');
}

// Test MongoDB connection
async function testConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://user:sshkey@cluster0.bgd0ike.mongodb.net/neumad';
  
  console.log('\n=== TESTING MONGODB CONNECTION ===');
  console.log('Using URI:', uri.substring(0, 30) + '...');
  
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Test User collection
    const UserModel = mongoose.models.User || await import('../models/userModel.js').then(m => m.UserModel);
    const userCount = await UserModel.countDocuments();
    console.log(`\n✅ User collection has ${userCount} documents`);
    
    // Test Blog collection  
    const BlogModel = mongoose.models.Blog || await import('../models/blogModel.js').then(m => m.BlogModel);
    const blogCount = await BlogModel.countDocuments();
    console.log(`✅ Blog collection has ${blogCount} documents`);
    
    // Find a sample user with blogs
    const sampleUser = await UserModel.findOne({ 
      $or: [
        { 'blogPosts.0': { $exists: true } },
        { 'blogsCreated.0': { $exists: true } }
      ]
    }).select('username blogPosts blogsCreated');
    
    if (sampleUser) {
      console.log(`\n📊 Sample user with blogs: ${sampleUser.username}`);
      console.log(`   - blogPosts: ${sampleUser.blogPosts?.length || 0}`);
      console.log(`   - blogsCreated: ${sampleUser.blogsCreated?.length || 0}`);
    } else {
      console.log('\n📊 No users found with blog data yet');
    }
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('\n✅ Connection closed');
    }
  }
}

// Run the test
testConnection()
  .then(() => {
    console.log('\n=== TEST COMPLETE ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n=== TEST FAILED ===');
    console.error(error);
    process.exit(1);
  });

///////////////////////// END TEST CONNECTION SCRIPT /////////////////////////