///////////////////////// START COMPLETE BLOG FIX /////////////////////////
// completeBlogFix.js - Comprehensive fix for blog integration

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../../.env') });

console.log('=== COMPLETE BLOG INTEGRATION FIX ===\n');

async function fixBlogIntegration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    const userCollection = db.collection('User');
    const blogCollection = db.collection('Blog');
    
    // Step 1: Check current state
    console.log('STEP 1: Checking current state...\n');
    
    const user = await userCollection.findOne({ username: 'Neumad' });
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User has blogPosts field:', user?.blogPosts ? 'Yes' : 'No');
    console.log('Current blogPosts count:', user?.blogPosts?.length || 0);
    
    const blogs = await blogCollection.find({}).toArray();
    console.log('\nTotal blogs in database:', blogs.length);
    
    // Step 2: Fix author username case sensitivity
    console.log('\nSTEP 2: Fixing blog author usernames...\n');
    
    for (const blog of blogs) {
      if (blog.author?.username) {
        const updates = {};
        
        // Ensure author username matches user's actual username
        if (blog.author.username !== user.username) {
          console.log(`Updating blog "${blog.title}" author from "${blog.author.username}" to "${user.username}"`);
          updates['author.username'] = user.username;
        }
        
        // Ensure author has all required fields
        updates['author.id'] = user._id.toString();
        updates['author.email'] = user.email;
        updates['author.name'] = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        
        await blogCollection.updateOne(
          { _id: blog._id },
          { $set: updates }
        );
      }
    }
    
    // Step 3: Build blog arrays
    console.log('\nSTEP 3: Building blog arrays...\n');
    
    const updatedBlogs = await blogCollection.find({ 'author.username': user.username }).toArray();
    console.log('Blogs matching user:', updatedBlogs.length);
    
    const blogPosts = [];
    const blogsCreated = [];
    const savedBlogs = [];
    const likedBlogs = [];
    const blogHistory = [];
    
    for (const blog of updatedBlogs) {
      // Add to blogPosts
      const blogPost = {
        blogId: blog._id,
        title: blog.title || 'Untitled',
        slug: blog.slug || '',
        category: blog.category?.category || 'dine',
        snippet: blog.snippet?.text || '',
        thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
        status: blog.status || 'published',
        publishedAt: blog.publishedAt || blog.createdAt || new Date(),
        addedAt: new Date()
      };
      blogPosts.push(blogPost);
      console.log(`  + Added to blogPosts: ${blog.title}`);
      
      // Add to blogsCreated
      const blogCreated = {
        blogId: blog._id,
        title: blog.title || 'Untitled',
        slug: blog.slug || '',
        status: blog.status || 'published',
        publishedAt: blog.publishedAt || blog.createdAt || new Date(),
        createdAt: blog.createdAt || new Date()
      };
      blogsCreated.push(blogCreated);
    }
    
    // Step 4: Update user document with ALL blog fields
    console.log('\nSTEP 4: Updating user document...\n');
    
    const updateData = {
      blogPosts: blogPosts,
      blogsCreated: blogsCreated,
      savedBlogs: savedBlogs,
      likedBlogs: likedBlogs,
      blogHistory: blogHistory
    };
    
    const result = await userCollection.updateOne(
      { _id: user._id },
      { $set: updateData }
    );
    
    console.log('Update result:', result.modifiedCount > 0 ? '✅ Success' : '❌ Failed');
    
    // Step 5: Verify the fix
    console.log('\nSTEP 5: Verifying the fix...\n');
    
    const fixedUser = await userCollection.findOne({ _id: user._id });
    console.log('User now has:');
    console.log('  - blogPosts:', fixedUser.blogPosts?.length || 0);
    console.log('  - blogsCreated:', fixedUser.blogsCreated?.length || 0);
    console.log('  - savedBlogs:', fixedUser.savedBlogs?.length || 0);
    console.log('  - likedBlogs:', fixedUser.likedBlogs?.length || 0);
    console.log('  - blogHistory:', fixedUser.blogHistory?.length || 0);
    
    if (fixedUser.blogPosts && fixedUser.blogPosts.length > 0) {
      console.log('\nBlog posts in user document:');
      fixedUser.blogPosts.forEach((post, i) => {
        console.log(`  ${i + 1}. ${post.title} (${post.status}) - ${post.slug}`);
      });
    }
    
    // Step 6: Test the blog query
    console.log('\nSTEP 6: Testing blog queries...\n');
    
    // Test query 1: By exact username
    const test1 = await blogCollection.find({ 'author.username': user.username }).toArray();
    console.log(`Query 1 - Exact username "${user.username}":`, test1.length, 'blogs');
    
    // Test query 2: Case insensitive
    const test2 = await blogCollection.find({ 
      'author.username': { $regex: new RegExp(`^${user.username}$`, 'i') } 
    }).toArray();
    console.log(`Query 2 - Case insensitive:`, test2.length, 'blogs');
    
    // Test query 3: Published only
    const test3 = await blogCollection.find({ 
      'author.username': user.username,
      status: 'published'
    }).toArray();
    console.log(`Query 3 - Published only:`, test3.length, 'blogs');
    
    console.log('\n✅ Blog integration fix completed!');
    console.log('\nNEXT STEPS:');
    console.log('1. Restart your server (both authServer and main server)');
    console.log('2. Clear browser cache and localStorage');
    console.log('3. Log in again');
    console.log('4. Visit your profile page');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
}

// Run the fix
fixBlogIntegration()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

///////////////////////// END COMPLETE BLOG FIX /////////////////////////