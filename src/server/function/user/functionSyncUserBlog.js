///////////////////////// START SYNC BLOGS SCRIPT /////////////////////////
// src/server/function/user/functionSyncUserBlog.js - Run this script to sync existing blogs with user blogPosts


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

console.log('========================= BLOG SYNC SCRIPT (FIXED) =========================');
console.log('This script will sync all existing blogs to their authors\' blogPosts arrays');
console.log('==========================================================================\n');

// Import models
import { UserModel } from '../../models/userModel.js';
import { BlogModel } from '../../models/blogModel.js';

async function syncAllUserBlogs() {
  try {
    // Connect to MongoDB
    console.log('[SYNC] Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('[SYNC] Connected successfully!\n');
    
    // First, let's see what users we have
    console.log('[SYNC] Checking existing users...');
    const allUsers = await UserModel.find({}).select('username email');
    console.log(`[SYNC] Found ${allUsers.length} users in database:`);
    allUsers.forEach(u => console.log(`  - ${u.username} (${u.email})`));
    
    // Get all unique authors from blogs
    console.log('\n[SYNC] Finding all blog authors...');
    const blogs = await BlogModel.find({}).select('author title');
    console.log(`[SYNC] Found ${blogs.length} blogs`);
    
    // Group blogs by author
    const blogsByAuthor = {};
    blogs.forEach(blog => {
      const authorUsername = blog.author?.username;
      if (authorUsername) {
        if (!blogsByAuthor[authorUsername]) {
          blogsByAuthor[authorUsername] = [];
        }
        blogsByAuthor[authorUsername].push(blog);
      }
    });
    
    console.log(`[SYNC] Found ${Object.keys(blogsByAuthor).length} unique authors with blogs:`);
    Object.keys(blogsByAuthor).forEach(author => {
      console.log(`  - ${author} (${blogsByAuthor[author].length} blogs)`);
    });
    
    let totalBlogsSynced = 0;
    let totalUsersProcessed = 0;
    let errors = [];
    
    // Process each author
    for (const [authorUsername, authorBlogs] of Object.entries(blogsByAuthor)) {
      console.log(`\n[SYNC] Processing author: ${authorUsername}`);
      
      try {
        // Try to find user by username (case-insensitive)
        let user = await UserModel.findOne({ 
          username: { $regex: new RegExp(`^${authorUsername}$`, 'i') }
        });
        
        if (!user) {
          // Try to find by email from blog author info
          const firstBlog = authorBlogs[0];
          if (firstBlog.author?.email) {
            console.log(`[SYNC] Trying to find user by email: ${firstBlog.author.email}`);
            user = await UserModel.findOne({ email: firstBlog.author.email });
          }
        }
        
        if (!user) {
          console.log(`[SYNC] ❌ User not found for author: ${authorUsername}`);
          errors.push(`User not found: ${authorUsername}`);
          continue;
        }
        
        console.log(`[SYNC] ✅ Found user: ${user.username} (${user.email})`);
        
        // Initialize arrays if they don't exist
        if (!user.blogPosts) {
          user.blogPosts = [];
          console.log(`[SYNC] Initialized blogPosts array`);
        }
        
        if (!user.blogsCreated) {
          user.blogsCreated = [];
          console.log(`[SYNC] Initialized blogsCreated array`);
        }
        
        // Get full blog details
        const userBlogs = await BlogModel.find({ 
          'author.username': authorUsername 
        }).sort({ publishedAt: -1 });
        
        console.log(`[SYNC] Processing ${userBlogs.length} blogs for ${user.username}`);
        
        let blogsAddedToPosts = 0;
        let blogsAddedToCreated = 0;
        
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
              publishedAt: blog.publishedAt || blog.createdAt || new Date(),
              addedAt: new Date()
            });
            blogsAddedToPosts++;
            console.log(`[SYNC]   + Added to blogPosts: "${blog.title}"`);
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
              publishedAt: blog.publishedAt || blog.createdAt || new Date(),
              createdAt: blog.createdAt || new Date()
            });
            blogsAddedToCreated++;
            console.log(`[SYNC]   + Added to blogsCreated: "${blog.title}"`);
          }
        }
        
        if (blogsAddedToPosts > 0 || blogsAddedToCreated > 0) {
          // Mark arrays as modified
          user.markModified('blogPosts');
          user.markModified('blogsCreated');
          
          await user.save();
          console.log(`[SYNC] ✅ Saved changes for ${user.username}:`);
          console.log(`[SYNC]    - Added ${blogsAddedToPosts} to blogPosts (total: ${user.blogPosts.length})`);
          console.log(`[SYNC]    - Added ${blogsAddedToCreated} to blogsCreated (total: ${user.blogsCreated.length})`);
          totalBlogsSynced += blogsAddedToPosts;
        } else {
          console.log(`[SYNC] ✓ All blogs already synced for ${user.username}`);
        }
        
        totalUsersProcessed++;
        
      } catch (error) {
        console.error(`[SYNC] ❌ Error processing author ${authorUsername}:`, error.message);
        errors.push(`Error with ${authorUsername}: ${error.message}`);
      }
    }
    
    // Summary
    console.log('\n========================= SYNC SUMMARY =========================');
    console.log(`Total authors found: ${Object.keys(blogsByAuthor).length}`);
    console.log(`Total users processed: ${totalUsersProcessed}`);
    console.log(`Total blogs added to blogPosts: ${totalBlogsSynced}`);
    console.log(`Errors encountered: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Verify the sync worked
    console.log('\n[SYNC] Verifying sync results...');
    const usersWithBlogs = await UserModel.find({
      $or: [
        { 'blogPosts.0': { $exists: true } },
        { 'blogsCreated.0': { $exists: true } }
      ]
    }).select('username email blogPosts blogsCreated');
    
    console.log(`\n[SYNC] Users with blog data after sync: ${usersWithBlogs.length}`);
    usersWithBlogs.forEach(user => {
      console.log(`  - ${user.username}: ${user.blogPosts?.length || 0} blogPosts, ${user.blogsCreated?.length || 0} blogsCreated`);
    });
    
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

// Run the sync
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule || process.argv.includes('--run')) {
  console.log('[SYNC] Starting sync process...\n');
  
  syncAllUserBlogs()
    .then(() => {
      console.log('\n🎉 Blog sync completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Blog sync failed:', error);
      process.exit(1);
    });
} else {
  console.log('Fixed Blog Sync Script');
  console.log('=====================');
  console.log('Usage:');
  console.log('  node functionSyncUserBlogFixed.js --run    # Run the sync');
}

export default syncAllUserBlogs;

///////////////////////// END SYNC BLOGS SCRIPT /////////////////////////