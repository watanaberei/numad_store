///////////////////////// START SYNC BLOGS SCRIPT /////////////////////////
// src/server/function/user/functionSyncUserBlog.js - Run this script to sync existing blogs with user blogPosts

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

// Now import the MongoDB modules AFTER loading env vars
const { connectDB, UserModel, BlogModel } = await import('../../data/mongodb/mongodb.js');

console.log('========================= SYNC USER BLOGS SCRIPT =========================');
console.log('This script will sync all existing blogs to their authors\' blogPosts arrays');
console.log('========================================================================\n');

// Debug: Check if environment variables are loaded
console.log('[SYNC] Environment check:');
console.log('[SYNC] MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('[SYNC] NODE_ENV:', process.env.NODE_ENV);

async function syncAllUserBlogs() {
  try {
    // Connect to MongoDB
    console.log('[SYNC] Connecting to MongoDB...');
    
    // If connectDB is still not working, connect directly
    if (!mongoose.connection.readyState) {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set. Please check your .env file.');
      }
      
      console.log('[SYNC] Using MongoDB URI:', mongoUri.substring(0, 20) + '...');
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    
    console.log('[SYNC] Connected successfully!\n');
    
    // Get all unique authors from blogs
    console.log('[SYNC] Finding all blog authors...');
    const authors = await BlogModel.distinct('author.username');
    console.log(`[SYNC] Found ${authors.length} unique authors with blogs\n`);
    
    let totalBlogsSynced = 0;
    let totalUsersProcessed = 0;
    let errors = [];
    
    // Process each author
    for (const username of authors) {
      if (!username) {
        console.log('[SYNC] Skipping blog with no author username');
        continue;
      }
      
      console.log(`\n[SYNC] Processing user: ${username}`);
      
      try {
        // Find the user
        const user = await UserModel.findOne({ username: username.toLowerCase() });
        
        if (!user) {
          console.log(`[SYNC] ❌ User not found: ${username}`);
          errors.push(`User not found: ${username}`);
          continue;
        }
        
        // Initialize arrays if they don't exist
        if (!user.blogPosts) {
          user.blogPosts = [];
          console.log(`[SYNC] Initialized blogPosts array for ${username}`);
        }
        
        if (!user.blogsCreated) {
          user.blogsCreated = [];
          console.log(`[SYNC] Initialized blogsCreated array for ${username}`);
        }
        
        // Find all blogs by this author
        const userBlogs = await BlogModel.find({ 
          'author.username': username 
        }).sort({ publishedAt: -1 });
        
        console.log(`[SYNC] Found ${userBlogs.length} blogs for ${username}`);
        
        let blogsAdded = 0;
        let blogsUpdated = 0;
        
        // Process each blog
        for (const blog of userBlogs) {
          // Check if blog already exists in blogPosts
          const existsInPosts = user.blogPosts.some(bp => 
            bp.blogId?.toString() === blog._id.toString()
          );
          
          if (!existsInPosts) {
            // Add to blogPosts
            user.blogPosts.push({
              blogId: blog._id,
              title: blog.title,
              slug: blog.slug,
              category: blog.category?.category || 'dine',
              snippet: blog.snippet?.text || '',
              thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
              status: blog.status || 'published',
              publishedAt: blog.publishedAt || blog.createdAt,
              addedAt: new Date()
            });
            blogsAdded++;
            console.log(`[SYNC]   + Added blog "${blog.title}" to blogPosts`);
          }
          
          // Check if blog exists in blogsCreated
          const existsInCreated = user.blogsCreated.some(bc => 
            bc.blogId?.toString() === blog._id.toString()
          );
          
          if (!existsInCreated) {
            // Add to blogsCreated
            user.blogsCreated.push({
              blogId: blog._id,
              title: blog.title,
              slug: blog.slug,
              status: blog.status || 'published',
              publishedAt: blog.publishedAt || blog.createdAt,
              createdAt: blog.createdAt || new Date()
            });
            blogsUpdated++;
            console.log(`[SYNC]   + Added blog "${blog.title}" to blogsCreated`);
          }
        }
        
        if (blogsAdded > 0 || blogsUpdated > 0) {
          await user.save();
          console.log(`[SYNC] ✅ Saved changes for ${username}: ${blogsAdded} added to blogPosts, ${blogsUpdated} added to blogsCreated`);
          totalBlogsSynced += blogsAdded;
        } else {
          console.log(`[SYNC] ✓ All blogs already synced for ${username}`);
        }
        
        totalUsersProcessed++;
        
      } catch (error) {
        console.error(`[SYNC] ❌ Error processing user ${username}:`, error.message);
        errors.push(`Error with ${username}: ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n========================= SYNC SUMMARY =========================');
    console.log(`Total users processed: ${totalUsersProcessed}`);
    console.log(`Total blogs synced to blogPosts: ${totalBlogsSynced}`);
    console.log(`Errors encountered: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Verify the sync by checking a user
    if (authors.length > 0) {
      const testUser = await UserModel.findOne({ username: authors[0].toLowerCase() })
        .select('username blogPosts blogsCreated');
      console.log('\n[SYNC] Verification - Sample user after sync:');
      console.log(`  Username: ${testUser.username}`);
      console.log(`  BlogPosts count: ${testUser.blogPosts?.length || 0}`);
      console.log(`  BlogsCreated count: ${testUser.blogsCreated?.length || 0}`);
    }
    
    console.log('\n✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Fatal error during sync:', error);
    throw error;
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('\n[SYNC] Database connection closed');
    }
  }
}

// Run the sync - ES Module compatible check
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule || process.argv.includes('--run')) {
  console.log('[SYNC] Starting sync process...\n');
  
  syncAllUserBlogs()
    .then(() => {
      console.log('\n🎉 Blog sync completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Blog sync failed:', error);
      process.exit(1);
    });
} else {
  console.log('Blog Sync Script');
  console.log('================');
  console.log('Usage:');
  console.log('  node functionSyncUserBlog.js --run    # Run the sync');
  console.log('');
  console.log('This script will:');
  console.log('1. Find all blogs in the Blog collection');
  console.log('2. Match them to their authors in the User collection');
  console.log('3. Add missing blogs to each user\'s blogPosts array');
  console.log('4. Ensure all created blogs are in the blogsCreated array');
}

export default syncAllUserBlogs;

///////////////////////// END SYNC BLOGS SCRIPT /////////////////////////