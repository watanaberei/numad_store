// migration/syncUserBlogs.js
import { connectDB, UserModel, BlogModel } from '../../data/mongodb/mongodb.js';

async function syncAllUserBlogs() {
  await connectDB();
  
  console.log('Starting blog sync migration...');
  
  const users = await UserModel.find({ blogsCreated: { $exists: true, $ne: [] } });
  
  for (const user of users) {
    const blogs = await BlogModel.find({ 'author.username': user.username });
    
    // Update user's blogPosts array
    for (const blog of blogs) {
      const exists = user.blogPosts.some(p => p.blogId?.toString() === blog._id.toString());
      
      if (!exists) {
        user.blogPosts.push({
          blogId: blog._id,
          title: blog.title,
          slug: blog.slug,
          category: blog.category?.category || 'dine',
          snippet: blog.snippet?.text || '',
          thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
          status: blog.status,
          publishedAt: blog.publishedAt,
          addedAt: new Date()
        });
      }
    }
    
    await user.save();
    console.log(`Updated ${user.username}: ${user.blogPosts.length} blog posts`);
  }
  
  console.log('Migration complete!');
  process.exit(0);
}

syncAllUserBlogs().catch(console.error);