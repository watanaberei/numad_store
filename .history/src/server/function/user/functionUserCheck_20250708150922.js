
import dotenv from 'dotenv';
import { connectDB, UserModel, BlogModel } from '../../data/mongodb/mongodb.js';

dotenv.config();

async function ensureUserExists() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Check if neumad user exists
    const existingUser = await UserModel.findOne({ 
      username: { $regex: /^neumad$/i } 
    });
    
    if (existingUser) {
      console.log('User found:', {
        username: existingUser.username,
        email: existingUser.email,
        isActive: existingUser.isActive,
        id: existingUser._id
      });
      
      // Ensure user is active and username is lowercase
      if (!existingUser.isActive || existingUser.username !== 'neumad') {
        existingUser.username = 'neumad';
        existingUser.isActive = true;
        await existingUser.save();
        console.log('User updated to be active with lowercase username');
      }
    } else {
      console.log('User not found, creating new user...');
      
      // Create new user
      const newUser = new UserModel({
        username: 'neumad',
        email: 'neumad@example.com',
        password: 'neumad123', // Change this!
        isActive: true,
        firstName: 'Neumad',
        lastName: 'User',
        headline: 'Welcome to Neumad',
        overview: 'A work-centric social review platform for entrepreneurs and creators.',
        profession: 'Platform Admin',
        company: 'Neumad',
        neumadicStars: 100,
        profileVisibility: {
          activity: 'public',
          posts: 'public',
          places: 'public',
          reviews: 'public'
        },
        // Add some sample blog posts
        blogPosts: [
          {
            blogId: new mongoose.Types.ObjectId(),
            title: 'Welcome to Neumad',
            slug: 'welcome-to-neumad',
            category: 'work',
            snippet: 'Discover the best places to work, create, and collaborate.',
            thumbnail: '/images/default-blog.jpg',
            status: 'published',
            publishedAt: new Date(),
            addedAt: new Date()
          }
        ]
      });
      
      await newUser.save();
      console.log('User created successfully:', {
        username: newUser.username,
        email: newUser.email,
        id: newUser._id
      });
    }
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

ensureUserExists();

///////////////////////// END MIGRATION SCRIPT /////////////////////////