import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../../.env') });

console.log('=== FORCE BLOG SYNC ===\n');

async function forceSyncBlogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get collections directly
    const db = mongoose.connection.db;
    const userCollection = db.collection('User');
    const blogCollection = db.collection('Blog');
    
    // Find the user
    console.log('Finding user...');
    const user = await userCollection.findOne({ username: 'Neumad' });
    
    if (!user) {
      console.error('❌ User not found!');
      return;
    }
    
    console.log(`✅ Found user: ${user.username} (${user.email})`);
    console.log(`Current blogPosts: ${user.blogPosts?.length || 'field not exists'}`);
    console.log(`Current blogsCreated: ${user.blogsCreated?.length || 'field not exists'}`);
    
    // Find all blogs
    console.log('\nFinding blogs...');
    const blogs = await blogCollection.find({ 'author.username': 'Neumad' }).toArray();
    console.log(`✅ Found ${blogs.length} blogs\n`);
    
    // Create blog arrays
    const blogPosts = [];
    const blogsCreated = [];
    
    for (const blog of blogs) {
      console.log(`Processing blog: ${blog.title}`);
      
      // Add to blogPosts
      blogPosts.push({
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
      
      // Add to blogsCreated
      blogsCreated.push({
        blogId: blog._id,
        title: blog.title,
        slug: blog.slug,
        status: blog.status || 'published',
        publishedAt: blog.publishedAt || blog.createdAt || new Date(),
        createdAt: blog.createdAt || new Date()
      });
    }
    
    console.log(`\nPrepared ${blogPosts.length} blog posts`);
    
    // Update user document directly
    console.log('\nUpdating user document...');
    const updateResult = await userCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          blogPosts: blogPosts,
          blogsCreated: blogsCreated,
          // Also initialize these if they don't exist
          savedBlogs: user.savedBlogs || [],
          likedBlogs: user.likedBlogs || [],
          blogHistory: user.blogHistory || []
        }
      }
    );
    
    console.log('Update result:', updateResult);
    
    // Verify the update
    console.log('\nVerifying update...');
    const updatedUser = await userCollection.findOne({ _id: user._id });
    console.log(`✅ User now has:`);
    console.log(`   - blogPosts: ${updatedUser.blogPosts?.length || 0} entries`);
    console.log(`   - blogsCreated: ${updatedUser.blogsCreated?.length || 0} entries`);
    
    // Display the blog posts
    if (updatedUser.blogPosts && updatedUser.blogPosts.length > 0) {
      console.log('\nBlog posts added:');
      updatedUser.blogPosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title} (${post.slug})`);
      });
    }
    
    console.log('\n✅ Force sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
}

// Run it
forceSyncBlogs()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });