///////////////////////// START API TEST SCRIPT /////////////////////////
// testBlogAPI.js - Test the blog API endpoint

import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:4500';
const username = 'Neumad';

async function testBlogAPI() {
  console.log('=== TESTING BLOG API ===\n');
  
  try {
    // Test 1: User profile endpoint
    console.log('1. Testing user profile endpoint...');
    const profileUrl = `${SERVER_URL}/api/user/${username}`;
    console.log(`   GET ${profileUrl}`);
    
    const profileResponse = await fetch(profileUrl);
    const profileData = await profileResponse.json();
    
    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   Success: ${profileData.success}`);
    if (profileData.user) {
      console.log(`   User found: ${profileData.user.username}`);
      console.log(`   BlogPosts: ${profileData.user.blogPosts?.length || 0}`);
      console.log(`   BlogsCreated: ${profileData.user.blogsCreated?.length || 0}`);
    }
    
    // Test 2: User blogs endpoint
    console.log('\n2. Testing user blogs endpoint...');
    const blogsUrl = `${SERVER_URL}/api/user/${username}/blogs`;
    console.log(`   GET ${blogsUrl}`);
    
    const blogsResponse = await fetch(blogsUrl);
    const blogsData = await blogsResponse.json();
    
    console.log(`   Status: ${blogsResponse.status}`);
    console.log(`   Success: ${blogsData.success}`);
    console.log(`   BlogPosts returned: ${blogsData.blogPosts?.length || 0}`);
    console.log(`   BlogsCreated returned: ${blogsData.blogsCreated?.length || 0}`);
    
    if (blogsData.blogPosts && blogsData.blogPosts.length > 0) {
      console.log('\n   Sample blog posts:');
      blogsData.blogPosts.slice(0, 3).forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title} (${post.status})`);
      });
    }
    
    // Test 3: Direct blog endpoint
    console.log('\n3. Testing direct blog endpoint...');
    const blogApiUrl = `${SERVER_URL}/api/blog?author=${username}&status=published`;
    console.log(`   GET ${blogApiUrl}`);
    
    const blogApiResponse = await fetch(blogApiUrl);
    const blogApiData = await blogApiResponse.json();
    
    console.log(`   Status: ${blogApiResponse.status}`);
    console.log(`   Blogs returned: ${blogApiData.blogs?.length || 0}`);
    
    if (blogApiData.blogs && blogApiData.blogs.length > 0) {
      console.log('\n   Sample blogs:');
      blogApiData.blogs.slice(0, 3).forEach((blog, index) => {
        console.log(`   ${index + 1}. ${blog.title} by ${blog.author?.username}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Run the test
testBlogAPI()
  .then(() => {
    console.log('\n✅ API test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ API test failed:', error);
    process.exit(1);
  });

///////////////////////// END API TEST SCRIPT /////////////////////////