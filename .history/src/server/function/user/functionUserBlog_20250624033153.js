///////////////////////// START SYNC BLOGS SCRIPT /////////////////////////
// src/server/scripts/syncUserBlogs.js - Run this script to sync existing blogs with user blogPosts

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, UserModel, BlogModel, blogOperations } from '../../data/mongodb/mongodb.js';

dotenv.config();

console.log('========================= SYNC USER BLOGS SCRIPT =========================');
console.log('This script will sync all existing blogs to their authors\' blogPosts arrays');
console.log('========================================================================\n');

async function syncAllUserBlogs() {
  try {
    // Connect to MongoDB
    console.log('[SYNC] Connecting to MongoDB...');
    await connectDB();
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
        const user = await UserModel.findOne({ username });
        
        if (!user) {
          console.log(`[SYNC] WARNING: User '${username}' not found in User collection`);
          errors.push({ username, error: 'User not found' });
          continue;
        }
        
        // Find all blogs by this author
        const userBlogs = await BlogModel.find({
          'author.username': username
        }).select('_id slug title snippet category media status publishedAt createdAt');
        
        console.log(`[SYNC] Found ${userBlogs.length} blogs for user ${username}`);
        
        // Clear existing blogPosts to avoid duplicates
        const existingCount = user.blogPosts.length;
        user.blogPosts = [];
        user.blogsCreated = [];
        
        // Add all blogs to user's arrays
        for (const blog of userBlogs) {
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
          
          // Add to blogsCreated
          user.blogsCreated.push({
            blogId: blog._id.toString(),
            title: blog.title,
            slug: blog.slug,
            status: blog.status || 'published',
            createdAt: blog.createdAt,
            publishedAt: blog.publishedAt || blog.createdAt,
            views: 0,
            likes: 0
          });
        }
        
        // Save the user
        await user.save();
        
        console.log(`[SYNC] ✅ Updated user ${username}:`);
        console.log(`  - Previous blog posts: ${existingCount}`);
        console.log(`  - New blog posts: ${user.blogPosts.length}`);
        console.log(`  - Blogs created: ${user.blogsCreated.length}`);
        
        totalBlogsSynced += userBlogs.length;
        totalUsersProcessed++;
        
      } catch (error) {
        console.error(`[SYNC] ❌ Error processing user ${username}:`, error.message);
        errors.push({ username, error: error.message });
      }
    }
    
    // Also check for blogs without authors
    console.log('\n[SYNC] Checking for blogs without authors...');
    const orphanBlogs = await BlogModel.find({
      $or: [
        { 'author.username': { $exists: false } },
        { 'author.username': null },
        { 'author.username': '' }
      ]
    }).select('slug title');
    
    if (orphanBlogs.length > 0) {
      console.log(`[SYNC] Found ${orphanBlogs.length} blogs without authors:`);
      orphanBlogs.forEach(blog => {
        console.log(`  - ${blog.title} (${blog.slug})`);
      });
    }
    
    // Print summary
    console.log('\n========================================================================');
    console.log('SYNC COMPLETED!');
    console.log('========================================================================');
    console.log(`Total users processed: ${totalUsersProcessed}`);
    console.log(`Total blogs synced: ${totalBlogsSynced}`);
    console.log(`Errors encountered: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(err => {
        console.log(`  - ${err.username}: ${err.error}`);
      });
    }
    
    console.log('\n✅ Blog sync completed successfully!');
    
  } catch (error) {
    console.error('\n❌ SYNC FAILED:', error);
    throw error;
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n[SYNC] Database connection closed');
  }
}

// Run the sync
syncAllUserBlogs()
  .then(() => {
    console.log('\n[SYNC] Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n[SYNC] Script failed:', error);
    process.exit(1);
  });

///////////////////////// END SYNC BLOGS SCRIPT /////////////////////////