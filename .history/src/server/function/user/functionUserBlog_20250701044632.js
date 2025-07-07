///////////////////////// START SYNC BLOGS SCRIPT /////////////////////////
// src/server/function/user/functionUserBlog.js - Run this script to sync existing blogs with user blogPosts

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, UserModel, BlogModel } from '../../data/mongodb/mongodb.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log('========================= SYNC USER BLOGS SCRIPT =========================');
console.log('This script will sync all existing blogs to their authors\' blogPosts arrays');
console.log('========================================================================\n');

async function syncAllUserBlogs() {
  try {
    // Database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('[TEST] Attempting to connect...');
      await connectDB();
    }
    // Connect to MongoDB
    console.log('[SYNC] Connecting to MongoDB...');
    // await connectDB();
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
        
        // Find all blogs by this author
        const userBlogs = await BlogModel.find({ 
          'author.username': username 
        }).sort({ publishedAt: -1 });
        
        console.log(`[SYNC] Found ${userBlogs.length} blogs for ${username}`);
        
        let blogsAdded = 0;
        
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
          }
        }
        
        if (blogsAdded > 0) {
          await user.save();
          console.log(`[SYNC] ✅ Added ${blogsAdded} blogs to ${username}'s blogPosts`);
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
    console.log(`Total blogs synced: ${totalBlogsSynced}`);
    console.log(`Errors encountered: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Fatal error during sync:', error);
    throw error;
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n[SYNC] Database connection closed');
  }
}

// Run the sync - ES Module compatible check
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule || process.argv.includes('--run')) {
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
  console.log('  node functionUserBlog.js --run    # Run the sync');
  console.log('');
  console.log('This script will:');
  console.log('1. Find all blogs in the Blog collection');
  console.log('2. Match them to their authors in the User collection');
  console.log('3. Add missing blogs to each user\'s blogPosts array');
  console.log('4. Ensure all created blogs are in the blogsCreated array');
}

export default syncAllUserBlogs;

///////////////////////// END SYNC BLOGS SCRIPT /////////////////////////