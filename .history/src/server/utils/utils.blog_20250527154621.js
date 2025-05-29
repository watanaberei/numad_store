// Create this as a separate file: src/server/utils/utils.blog.js
// Or add this function to your existing data handling files

import { BlogModel } from '../data/mongodb/mongodb.js';

/**
 * Sync blog data to MongoDB
 * This function takes your completeBlogData and stores it in MongoDB
 * following the same pattern as store data
 */
export const syncBlogDataToMongoDB = async (completeBlogData) => {
  try {
    console.log('[BlogSync] Starting blog data sync to MongoDB');
    console.log(`[BlogSync] Processing ${completeBlogData.length} blogs`);
    
    const results = [];
    const errors = [];
    
    for (const blogData of completeBlogData) {
      try {
        // Validate required fields
        if (!blogData.slug) {
          console.warn('[BlogSync] Skipping blog without slug:', blogData);
          errors.push({ blog: blogData, error: 'Missing slug' });
          continue;
        }
        
        console.log(`[BlogSync] Processing blog: ${blogData.slug}`);
        
        // Format the blog data for MongoDB
        const formattedBlogData = {
          slug: blogData.slug,
          title: blogData.title || blogData.headline?.text || 'Untitled Blog',
          variant: 'blogs',
          
          // Category handling
          category: {
            category: blogData.category?.category || 'dine',
            categoryType: blogData.category?.categoryType || blogData.category?.category || 'dine'
          },
          
          // Snippet/description
          snippet: {
            text: blogData.snippet?.text || '',
            subtext: blogData.snippet?.subtext || ''
          },
          
          // Content sections
          content: {
            introduction: blogData.content?.introduction || '',
            body: blogData.content?.body || '',
            conclusion: blogData.content?.conclusion || '',
            stores: blogData.content?.stores || '',
            postscript: blogData.content?.postscript || '',
            blocks: blogData.content?.blocks || []
          },
          
          // Media
          media: {
            hero: blogData.media?.hero || '',
            thumbnail: blogData.media?.thumbnail || blogData.media?.hero || '',
            gallery: blogData.media?.gallery || []
          },
          
          // Tags
          tag: blogData.tag || [],
          
          // Author information
          author: {
            id: blogData.author?.id || 'default-author',
            name: blogData.author?.name || 'Anonymous',
            email: blogData.author?.email || 'anonymous@example.com',
            slug: blogData.author?.slug || 'anonymous',
            social: blogData.author?.social || ''
          },
          
          // Series information
          series: blogData.series || { series: 'General' },
          
          // Summary
          summary: blogData.summary || { text: [] },
          
          // Status and template
          status: blogData.status || 'published',
          template: blogData.template || 'freestyle',
          
          // Settings
          settings: {
            public: blogData.settings?.public !== false, // Default to true
            comments: blogData.settings?.comments !== false, // Default to true
            autosave: blogData.settings?.autosave || false
          },
          
          // Timestamps
          publishedAt: blogData.publishedAt || new Date(),
          createdAt: blogData.createdAt || new Date(),
          updatedAt: new Date(),
          lastUpdated: new Date(),
          
          // Views counter
          views: blogData.views || 0,
          
          // Store the complete original data for reference
          originalData: blogData
        };
        
        // Save or update in MongoDB
        const result = await BlogModel.findOneAndUpdate(
          { slug: blogData.slug },
          formattedBlogData,
          { 
            upsert: true, 
            new: true,
            setDefaultsOnInsert: true 
          }
        );
        
        results.push({
          slug: result.slug,
          title: result.title,
          id: result._id,
          status: 'success'
        });
        
        console.log(`[BlogSync] ✓ Blog synced: ${result.title}`);
        
      } catch (error) {
        console.error(`[BlogSync] ✗ Error syncing blog ${blogData.slug}:`, error);
        errors.push({ 
          blog: blogData.slug || 'unknown', 
          error: error.message 
        });
      }
    }
    
    console.log(`[BlogSync] Sync completed: ${results.length} successful, ${errors.length} errors`);
    
    return {
      success: true,
      message: `Blog sync completed: ${results.length} successful, ${errors.length} errors`,
      results,
      errors,
      summary: {
        total: completeBlogData.length,
        successful: results.length,
        failed: errors.length
      }
    };
    
  } catch (error) {
    console.error('[BlogSync] Fatal error during blog sync:', error);
    throw error;
  }
};

/**
 * Sync a single blog to MongoDB
 */
export const syncSingleBlogToMongoDB = async (blogData) => {
  try {
    console.log(`[BlogSync] Syncing single blog: ${blogData.slug}`);
    
    const result = await syncBlogDataToMongoDB([blogData]);
    
    if (result.results.length > 0) {
      return result.results[0];
    } else {
      throw new Error(result.errors[0]?.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('[BlogSync] Error syncing single blog:', error);
    throw error;
  }
};

/**
 * Fetch and sync blog data (if you have an external data source)
 */
export const fetchAndSyncBlogs = async () => {
  try {
    console.log('[BlogSync] Fetching and syncing blog data...');
    
    // If you have a function that returns completeBlogData, call it here
    // For example:
    // const DataBlog = await import('../data/DataPost.js');
    // const dataBlog = new DataBlog.default();
    // const completeBlogData = await dataBlog.getData();
    
    // For now, this is a placeholder - replace with your actual data source
    const completeBlogData = []; // Replace with your actual data fetching
    
    if (completeBlogData.length === 0) {
      console.warn('[BlogSync] No blog data found to sync');
      return { success: false, message: 'No blog data found' };
    }
    
    return await syncBlogDataToMongoDB(completeBlogData);
    
  } catch (error) {
    console.error('[BlogSync] Error fetching and syncing blogs:', error);
    throw error;
  }
};

// Usage example:
/*
// To sync your completeBlogData:
import { syncBlogDataToMongoDB } from './utils/blogSyncHelper.js';

// Assuming you have your completeBlogData
const result = await syncBlogDataToMongoDB(completeBlogData);
console.log('Sync result:', result);

// To sync a single blog:
import { syncSingleBlogToMongoDB } from './utils/blogSyncHelper.js';

const singleBlogResult = await syncSingleBlogToMongoDB(singleBlogData);
console.log('Single blog sync result:', singleBlogResult);
*/