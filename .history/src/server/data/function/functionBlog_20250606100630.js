///////////////////////// START BLOG DATABASE MIGRATION SCRIPT /////////////////////////
// fixBlogIndexes.js - Run this script to fix the duplicate key issue

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
  
// FIXED: Migration script to resolve BlogSlug duplicate key errors
async function fixBlogIndexes() {
  try {
    console.log('[Migration] Starting blog index migration...');
    
    const connectDB = async () => {
      try {
        console.log('[MongoDB] Attempting to connect to database...');
        
        if (mongoose.connection.readyState === 1) {
          console.log('[MongoDB] Using existing connection');
          return mongoose.connection;
        }
    
        const uri = process.env.MONGODB_URI;
        console.log('[MongoDB] Connecting to:', uri);
        
        const connection = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 20000,
          socketTimeoutMS: 45000,
          family: 4,
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        
        console.log('[MongoDB] Connected successfully to database');
        console.log('[MongoDB] Connection state:', mongoose.connection.readyState);
        console.log('[MongoDB] Database name:', mongoose.connection.name);
        
        return connection;
      } catch (error) {
        console.error('[MongoDB] Connection error:', error.message);
        throw error;
      }
    };

    // Connect to database and get Blog collection
    const db = await connectDB();
    const collection = db.connection.db.collection('Blog');
    console.log('[Migration] Connected to Blog collection');

    // STEP 1: Check current state
    const totalBlogs = await collection.countDocuments();
    console.log(`[Migration] Total blog documents: ${totalBlogs}`);
    
    const nullSlugs = await collection.countDocuments({ 
      $or: [
        { slug: null },
        { slug: undefined },
        { slug: '' },
        { slug: 'null' },
        { slug: 'undefined' }
      ]
    });
    console.log(`[Migration] Documents with null/invalid slugs: ${nullSlugs}`);
    
    // STEP 2: List all existing indexes
    console.log('[Migration] Existing indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // STEP 3: Remove the problematic unique index if it exists
    const problemIndexes = [
      'BlogSlug_1',
      'slug_1', 
      'blog_slug_unique'
    ];
    
    for (const indexName of problemIndexes) {
      try {
        await collection.dropIndex(indexName);
        console.log(`[Migration] ✅ Dropped problematic index: ${indexName}`);
      } catch (error) {
        console.log(`[Migration] ⚠️  Index ${indexName} not found or already dropped`);
      }
    }
    
    // STEP 4: Clean up documents with invalid slugs
    console.log('[Migration] Cleaning up documents with invalid slugs...');
    
    // Find documents with null/undefined/empty slugs
    const invalidDocs = await collection.find({ 
      $or: [
        { slug: null },
        { slug: undefined },
        { slug: '' },
        { slug: 'null' },
        { slug: 'undefined' }
      ]
    }).toArray();
    
    console.log(`[Migration] Found ${invalidDocs.length} documents with invalid slugs`);
    
    // Generate valid slugs for these documents
    for (const doc of invalidDocs) {
      let newSlug;
      if (doc.title) {
        newSlug = doc.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-')
          .substring(0, 100);
      }
      
      if (!newSlug || newSlug.length === 0) {
        newSlug = `blog-${doc._id.toString().slice(-8)}`;
      }
      
      // Ensure uniqueness
      let finalSlug = newSlug;
      let counter = 1;
      
      while (await collection.findOne({ slug: finalSlug, _id: { $ne: doc._id } })) {
        finalSlug = `${newSlug}-${counter}`;
        counter++;
      }
      
      await collection.updateOne(
        { _id: doc._id },
        { $set: { slug: finalSlug, updatedAt: new Date() } }
      );
      
      console.log(`[Migration] ✅ Fixed document ${doc._id}: "${doc.title || 'Untitled'}" -> slug: "${finalSlug}"`);
    }
    
    // STEP 5: Handle duplicate slugs
    console.log('[Migration] Checking for duplicate slugs...');
    
    const duplicatePipeline = [
      { 
        $match: { 
          slug: { 
            $exists: true, 
            $ne: null, 
            $ne: '', 
            $ne: 'null',
            $ne: 'undefined'
          } 
        } 
      },
      { $group: { _id: '$slug', count: { $sum: 1 }, docs: { $push: { id: '$_id', title: '$title' } } } },
      { $match: { count: { $gt: 1 } } }
    ];
    
    const duplicates = await collection.aggregate(duplicatePipeline).toArray();
    console.log(`[Migration] Found ${duplicates.length} duplicate slug groups`);
    
    for (const duplicate of duplicates) {
      console.log(`[Migration] Processing duplicate slug: "${duplicate._id}" (${duplicate.count} documents)`);
      
      // Keep the first document, rename the others
      const [keepDoc, ...renameDoc] = duplicate.docs;
      console.log(`[Migration] Keeping: ${keepDoc.title || 'Untitled'} (${keepDoc.id})`);
      
      for (let i = 0; i < renameDoc.length; i++) {
        const doc = renameDoc[i];
        const newSlug = `${duplicate._id}-${i + 1}`;
        
        await collection.updateOne(
          { _id: doc.id },
          { $set: { slug: newSlug, updatedAt: new Date() } }
        );
        
        console.log(`[Migration] ✅ Renamed: ${doc.title || 'Untitled'} (${doc.id}) -> slug: "${newSlug}"`);
      }
    }
    
    // STEP 6: Create the new sparse unique index
    console.log('[Migration] Creating sparse unique index...');
    
    try {
      await collection.createIndex(
        { slug: 1 }, 
        { 
          unique: true, 
          sparse: true, 
          background: true,
          name: 'slug_unique_sparse'
        }
      );
      console.log('[Migration] ✅ Created sparse unique index: slug_unique_sparse');
    } catch (error) {
      if (error.code === 11000) {
        console.log('[Migration] ⚠️  Unique constraint violation - there may still be duplicates');
        
        // Find remaining duplicates
        const remainingDuplicates = await collection.aggregate(duplicatePipeline).toArray();
        if (remainingDuplicates.length > 0) {
          console.log('[Migration] ❌ Still have duplicates:', remainingDuplicates.map(d => d._id));
          throw new Error('Cannot create unique index due to remaining duplicates');
        }
      } else {
        throw error;
      }
    }
    
    // STEP 7: Verify the fix
    console.log('[Migration] Verifying the migration...');
    
    const finalNulls = await collection.countDocuments({ 
      $or: [
        { slug: null },
        { slug: undefined },
        { slug: '' },
        { slug: 'null' },
        { slug: 'undefined' }
      ]
    });
    
    const finalDuplicates = await collection.aggregate(duplicatePipeline).toArray();
    const finalIndexes = await collection.indexes();
    const sparseIndex = finalIndexes.find(idx => idx.name === 'slug_unique_sparse');
    
    console.log('\n[Migration] ✅ MIGRATION COMPLETED');
    console.log('=====================================');
    console.log(`📊 Final Statistics:`);
    console.log(`   - Total blog documents: ${await collection.countDocuments()}`);
    console.log(`   - Documents with null slugs: ${finalNulls}`);
    console.log(`   - Duplicate slug groups: ${finalDuplicates.length}`);
    console.log(`   - Sparse unique index exists: ${sparseIndex ? '✅ Yes' : '❌ No'}`);
    
    if (finalNulls === 0 && finalDuplicates.length === 0 && sparseIndex) {
      console.log('\n🎉 Migration successful! Blog publishing should now work correctly.');
    } else {
      console.log('\n⚠️  Migration may not be complete. Please check the issues above.');
    }
    
    return connectDB;
    
  } catch (error) {
    console.error('[Migration] ❌ Error during migration:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('[Migration] Database connection closed');
  }
}

// FIXED: Additional utility function to test blog creation
async function testBlogCreation() {
  try {
    console.log('\n[Test] Testing blog creation...');
    
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/neumad";
    await mongoose.connect(uri);
    
    const db = mongoose.connection.db;
    const collection = db.collection('Blog');
    
    const testBlog = {
      slug: `test-blog-${Date.now()}`,
      title: 'Test Blog Post',
      status: 'draft',
      author: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      },
      content: {
        blocks: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(testBlog);
    console.log(`[Test] ✅ Test blog created successfully: ${result.insertedId}`);
    
    // Clean up test document
    await collection.deleteOne({ _id: result.insertedId });
    console.log('[Test] ✅ Test blog cleaned up');
    
  } catch (error) {
    console.error('[Test] ❌ Blog creation test failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Run the migration
if (process.argv.includes('--run')) {
  fixBlogIndexes()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
} else if (process.argv.includes('--test')) {
  testBlogCreation()
    .then(() => {
      console.log('\n🎉 Blog creation test passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Blog creation test failed:', error);
      process.exit(1);
    });
} else {
  console.log('Blog Index Migration Script');
  console.log('===========================');
  console.log('Usage:');
  console.log('  node fixBlogIndexes.js --run    # Run the migration');
  console.log('  node fixBlogIndexes.js --test   # Test blog creation');
  console.log('');
  console.log('This script will:');
  console.log('1. Remove problematic unique indexes on BlogSlug');
  console.log('2. Fix documents with null/invalid slugs');
  console.log('3. Resolve duplicate slug conflicts');
  console.log('4. Create a new sparse unique index');
  console.log('5. Verify the migration was successful');
}



export { fixBlogIndexes, testBlogCreation };

///////////////////////// END BLOG DATABASE MIGRATION SCRIPT /////////////////////////