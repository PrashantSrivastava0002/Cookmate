// Simple test script to demonstrate like and comment functionality
// Run this after starting the server with: node test-likes-comments.js

const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testLikesAndComments() {
  const baseUrl = 'localhost';
  const port = 2000; // Adjust if your server runs on a different port

  console.log('🧪 Testing Like and Comment Functionality\n');

  try {
    // First, create a test recipe
    console.log('1. Creating a test recipe...');
    const createRecipeOptions = {
      hostname: baseUrl,
      port: port,
      path: '/auth/recipe',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const testRecipe = {
      title: 'Test Recipe for Likes and Comments',
      ingredients: ['Test ingredient 1', 'Test ingredient 2'],
      instructions: 'Test instructions for the recipe',
      imageUrl: 'https://example.com/test-image.jpg'
    };

    const createResult = await makeRequest(createRecipeOptions, testRecipe);
    console.log('✅ Recipe created:', createResult.data.title);
    const recipeId = createResult.data._id;

    // Test liking the recipe
    console.log('\n2. Testing like functionality...');
    const likeOptions = {
      hostname: baseUrl,
      port: port,
      path: `/auth/recipe/${recipeId}/like`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const likeResult = await makeRequest(likeOptions);
    console.log('✅ Like result:', likeResult.data);

    // Test adding a comment
    console.log('\n3. Testing comment functionality...');
    const commentOptions = {
      hostname: baseUrl,
      port: port,
      path: `/auth/recipe/${recipeId}/comment`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const testComment = {
      user: 'Test User',
      text: 'This is a test comment for the recipe!'
    };

    const commentResult = await makeRequest(commentOptions, testComment);
    console.log('✅ Comment added:', commentResult.data);

    // Test getting comments
    console.log('\n4. Testing get comments functionality...');
    const getCommentsOptions = {
      hostname: baseUrl,
      port: port,
      path: `/auth/recipe/${recipeId}/comments`,
      method: 'GET',
    };

    const getCommentsResult = await makeRequest(getCommentsOptions);
    console.log('✅ Comments retrieved:', getCommentsResult.data);

    // Test adding another comment
    console.log('\n5. Adding another comment...');
    const testComment2 = {
      user: 'Another User',
      text: 'Great recipe! Thanks for sharing.'
    };

    const commentResult2 = await makeRequest(commentOptions, testComment2);
    console.log('✅ Second comment added:', commentResult2.data);

    // Test liking again (should increment)
    console.log('\n6. Liking the recipe again...');
    const likeResult2 = await makeRequest(likeOptions);
    console.log('✅ Second like result:', likeResult2.data);

    // Get the final recipe state
    console.log('\n7. Getting final recipe state...');
    const getRecipeOptions = {
      hostname: baseUrl,
      port: port,
      path: '/auth/recipe',
      method: 'GET',
      headers: {
        'Authorization': 'dummy-token' // You might need a real token
      },
    };

    const finalRecipeResult = await makeRequest(getRecipeOptions);
    const finalRecipe = finalRecipeResult.data.find(r => r._id === recipeId);
    
    if (finalRecipe) {
      console.log('✅ Final recipe state:');
      console.log(`   Title: ${finalRecipe.title}`);
      console.log(`   Likes: ${finalRecipe.likes}`);
      console.log(`   Comments: ${finalRecipe.comments.length}`);
      console.log('   Comment details:');
      finalRecipe.comments.forEach((comment, index) => {
        console.log(`     ${index + 1}. ${comment.user}: ${comment.text}`);
      });
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your server is running on port 2000');
    console.log('   Start it with: npm run start or npm run dev');
  }
}

// Run the tests
testLikesAndComments();
