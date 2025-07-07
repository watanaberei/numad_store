///////////////////////// START BLOG OPERATIONS MODULE /////////////////////////
// Add this to mongodb.js after the storeOperations section

// Blog operations with user synchronization
export const blogOperations = {
  // Create a new blog and sync with user
  async createBlog(blogData, userEmail) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      console.log('[MongoDB] Creating blog for user:', userEmail);
      
      // Find the user
      const user = await UserModel.findOne({ email: userEmail }).session(session);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Create the blog
      const blog = new BlogModel({
        ...blogData,
        author: {
          id: user._id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
          email: user.email,
          username: user.username
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await blog.save({ session });
      console.log('[MongoDB] Blog created with ID:', blog._id);
      
      // Add to user's blogPosts
      user.blogPosts.push({
        blogId: blog._id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category?.category || 'dine',
        snippet: blog.snippet?.text || '',
        thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
        status: blog.status || 'draft',
        publishedAt: blog.publishedAt,
        addedAt: new Date()
      });
      
      // Add to user's blogsCreated
      user.blogsCreated.push({
        blogId: blog._id,
        title: blog.title,
        slug: blog.slug,
        status: blog.status || 'draft',
        publishedAt: blog.publishedAt,
        createdAt: new Date()
      });
      
      await user.save({ session });
      console.log('[MongoDB] Blog synced with user successfully');
      
      await session.commitTransaction();
      return blog;
      
    } catch (error) {
      await session.abortTransaction();
      console.error('[MongoDB] Error creating blog:', error);
      throw error;
    } finally {
      session.endSession();
    }
  },
  
  // Update blog and sync with user
  async updateBlog(blogId, updates, userEmail) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      console.log('[MongoDB] Updating blog:', blogId);
      
      // Find the blog
      const blog = await BlogModel.findById(blogId).session(session);
      if (!blog) {
        throw new Error('Blog not found');
      }
      
      // Verify ownership
      if (blog.author.email !== userEmail) {
        throw new Error('Unauthorized to update this blog');
      }
      
      // Update the blog
      Object.assign(blog, updates);
      blog.updatedAt = new Date();
      await blog.save({ session });
      
      // Update user's blogPosts and blogsCreated
      const user = await UserModel.findOne({ email: userEmail }).session(session);
      if (user) {
        // Update in blogPosts
        const postIndex = user.blogPosts.findIndex(bp => 
          bp.blogId.toString() === blogId
        );
        if (postIndex !== -1) {
          user.blogPosts[postIndex] = {
            ...user.blogPosts[postIndex],
            title: blog.title,
            slug: blog.slug,
            category: blog.category?.category || 'dine',
            snippet: blog.snippet?.text || '',
            thumbnail: blog.media?.thumbnail || blog.media?.hero || '',
            status: blog.status,
            publishedAt: blog.publishedAt
          };
        }
        
        // Update in blogsCreated
        const createdIndex = user.blogsCreated.findIndex(bc => 
          bc.blogId.toString() === blogId
        );
        if (createdIndex !== -1) {
          user.blogsCreated[createdIndex] = {
            ...user.blogsCreated[createdIndex],
            title: blog.title,
            slug: blog.slug,
            status: blog.status,
            publishedAt: blog.publishedAt
          };
        }
        
        await user.save({ session });
      }
      
      await session.commitTransaction();
      console.log('[MongoDB] Blog updated and synced successfully');
      return blog;
      
    } catch (error) {
      await session.abortTransaction();
      console.error('[MongoDB] Error updating blog:', error);
      throw error;
    } finally {
      session.endSession();
    }
  },
  
  // Delete blog and sync with user
  async deleteBlog(blogId, userEmail) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      console.log('[MongoDB] Deleting blog:', blogId);
      
      // Find the blog
      const blog = await BlogModel.findById(blogId).session(session);
      if (!blog) {
        throw new Error('Blog not found');
      }
      
      // Verify ownership
      if (blog.author.email !== userEmail) {
        throw new Error('Unauthorized to delete this blog');
      }
      
      // Delete the blog
      await BlogModel.deleteOne({ _id: blogId }).session(session);
      
      // Remove from user's arrays
      const user = await UserModel.findOne({ email: userEmail }).session(session);
      if (user) {
        // Remove from blogPosts
        user.blogPosts = user.blogPosts.filter(bp => 
          bp.blogId.toString() !== blogId
        );
        
        // Remove from blogsCreated
        user.blogsCreated = user.blogsCreated.filter(bc => 
          bc.blogId.toString() !== blogId
        );
        
        // Remove from savedBlogs
        user.savedBlogs = user.savedBlogs.filter(sb => 
          sb.blogId.toString() !== blogId
        );
        
        // Remove from likedBlogs
        user.likedBlogs = user.likedBlogs.filter(lb => 
          lb.blogId.toString() !== blogId
        );
        
        await user.save({ session });
      }
      
      await session.commitTransaction();
      console.log('[MongoDB] Blog deleted and user cleaned up successfully');
      return { success: true };
      
    } catch (error) {
      await session.abortTransaction();
      console.error('[MongoDB] Error deleting blog:', error);
      throw error;
    } finally {
      session.endSession();
    }
  },
  
  // Sync all existing blogs with users (migration helper)
  async syncAllUserBlogs() {
    try {
      console.log('[MongoDB] Starting blog-user synchronization...');
      
      // Get all blogs
      const blogs = await BlogModel.find({}).lean();
      console.log(`[MongoDB] Found ${blogs.length} blogs to sync`);
      
      let syncedCount = 0;
      let errors = [];
      
      for (const blog of blogs) {
        try {
          if (!blog.author?.username && !blog.author?.email) {
            console.log(`[MongoDB] Skipping blog ${blog._id} - no author info`);
            continue;
          }
          
          // Find the user
          const user = await UserModel.findOne({
            $or: [
              { username: blog.author.username },
              { email: blog.author.email }
            ]
          });
          
          if (!user) {
            console.log(`[MongoDB] User not found for blog ${blog._id}`);
            errors.push(`Blog ${blog._id}: User not found`);
            continue;
          }
          
          // Check if blog already in user's blogPosts
          const existsInPosts = user.blogPosts.some(bp => 
            bp.blogId?.toString() === blog._id.toString()
          );
          
          if (!existsInPosts) {
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
          }
          
          // Check if blog already in user's blogsCreated
          const existsInCreated = user.blogsCreated.some(bc => 
            bc.blogId?.toString() === blog._id.toString()
          );
          
          if (!existsInCreated) {
            user.blogsCreated.push({
              blogId: blog._id,
              title: blog.title,
              slug: blog.slug,
              status: blog.status || 'published',
              publishedAt: blog.publishedAt || blog.createdAt,
              createdAt: blog.createdAt || new Date()
            });
          }
          
          if (!existsInPosts || !existsInCreated) {
            await user.save();
            syncedCount++;
            console.log(`[MongoDB] Synced blog ${blog._id} with user ${user.username}`);
          }
          
        } catch (error) {
          console.error(`[MongoDB] Error syncing blog ${blog._id}:`, error.message);
          errors.push(`Blog ${blog._id}: ${error.message}`);
        }
      }
      
      console.log(`[MongoDB] Blog sync completed. Synced: ${syncedCount}, Errors: ${errors.length}`);
      
      return {
        success: true,
        synced: syncedCount,
        total: blogs.length,
        errors: errors
      };
      
    } catch (error) {
      console.error('[MongoDB] Error in blog sync:', error);
      throw error;
    }
  },
  
  // Get user's blog statistics
  async getUserBlogStats(username) {
    try {
      const user = await UserModel.findOne({ username: username.toLowerCase() })
        .select('blogPosts blogsCreated savedBlogs likedBlogs')
        .lean();
        
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get additional stats from Blog collection
      const publishedBlogs = await BlogModel.countDocuments({
        'author.username': username,
        status: 'published'
      });
      
      const draftBlogs = await BlogModel.countDocuments({
        'author.username': username,
        status: 'draft'
      });
      
      return {
        totalBlogPosts: user.blogPosts?.length || 0,
        publishedBlogPosts: user.blogPosts?.filter(bp => bp.status === 'published').length || 0,
        draftBlogPosts: user.blogPosts?.filter(bp => bp.status === 'draft').length || 0,
        totalBlogsCreated: user.blogsCreated?.length || 0,
        totalSavedBlogs: user.savedBlogs?.length || 0,
        totalLikedBlogs: user.likedBlogs?.length || 0,
        // From Blog collection
        publishedInCollection: publishedBlogs,
        draftsInCollection: draftBlogs
      };
      
    } catch (error) {
      console.error('[MongoDB] Error getting blog stats:', error);
      throw error;
    }
  }
};

///////////////////////// END BLOG OPERATIONS MODULE /////////////////////////