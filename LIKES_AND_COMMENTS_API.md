# Like and Comment API Documentation

This document describes the new like and comment functionality that has been added to the Recipe API.

## Database Schema

The Recipe schema now includes:
- `likes`: Number (default: 0) - Total number of likes for the recipe
- `comments`: Array of comment objects with:
  - `user`: String (required) - Name of the user who commented
  - `text`: String (required) - The comment text
  - `createdAt`: Date (default: current date) - When the comment was created

## API Endpoints

### Like Functionality

#### Like a Recipe
```
POST /recipe/:id/like
```
- **Description**: Increments the like count for a recipe
- **Parameters**: 
  - `id` (URL parameter): Recipe ID
- **Response**: 
  ```json
  {
    "message": "Recipe liked successfully",
    "likes": 5
  }
  ```

#### Unlike a Recipe
```
POST /recipe/:id/unlike
```
- **Description**: Decrements the like count for a recipe (minimum 0)
- **Parameters**: 
  - `id` (URL parameter): Recipe ID
- **Response**: 
  ```json
  {
    "message": "Recipe unliked successfully",
    "likes": 4
  }
  ```

### Comment Functionality

#### Add a Comment
```
POST /recipe/:id/comment
```
- **Description**: Adds a new comment to a recipe
- **Parameters**: 
  - `id` (URL parameter): Recipe ID
- **Request Body**:
  ```json
  {
    "user": "John Doe",
    "text": "This recipe is amazing!"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Comment added successfully",
    "comment": {
      "_id": "comment_id",
      "user": "John Doe",
      "text": "This recipe is amazing!",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "totalComments": 3
  }
  ```

#### Get All Comments for a Recipe
```
GET /recipe/:id/comments
```
- **Description**: Retrieves all comments for a specific recipe
- **Parameters**: 
  - `id` (URL parameter): Recipe ID
- **Response**: 
  ```json
  {
    "comments": [
      {
        "_id": "comment_id_1",
        "user": "John Doe",
        "text": "This recipe is amazing!",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "comment_id_2",
        "user": "Jane Smith",
        "text": "I tried this and it was delicious!",
        "createdAt": "2024-01-15T11:45:00.000Z"
      }
    ],
    "totalComments": 2
  }
  ```

#### Delete a Comment
```
DELETE /recipe/:recipeId/comment/:commentId
```
- **Description**: Removes a specific comment from a recipe
- **Parameters**: 
  - `recipeId` (URL parameter): Recipe ID
  - `commentId` (URL parameter): Comment ID to delete
- **Response**: 
  ```json
  {
    "message": "Comment deleted successfully",
    "totalComments": 1
  }
  ```

## Usage Examples

### Frontend Integration

Here are some example JavaScript functions you can use in your frontend:

```javascript
// Like a recipe
async function likeRecipe(recipeId) {
  try {
    const response = await fetch(`/recipe/${recipeId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    console.log('Recipe liked:', data);
    return data;
  } catch (error) {
    console.error('Error liking recipe:', error);
  }
}

// Add a comment
async function addComment(recipeId, user, text) {
  try {
    const response = await fetch(`/recipe/${recipeId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, text }),
    });
    const data = await response.json();
    console.log('Comment added:', data);
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
  }
}

// Get comments
async function getComments(recipeId) {
  try {
    const response = await fetch(`/recipe/${recipeId}/comments`);
    const data = await response.json();
    console.log('Comments:', data);
    return data;
  } catch (error) {
    console.error('Error getting comments:', error);
  }
}
```

## Testing

To test the functionality:

1. Start your server: `npm run start` or `npm run dev`
2. Run the test script: `node test-likes-comments.js`

The test script will:
- Create a test recipe
- Like the recipe multiple times
- Add comments
- Retrieve comments
- Display the final state

## Error Handling

All endpoints include proper error handling:
- 400: Bad Request (missing required fields)
- 404: Recipe or Comment not found
- 500: Internal server error

## Notes

- The like count cannot go below 0
- Comments are stored with timestamps
- All operations are persistent in the MongoDB database
- The existing recipe retrieval endpoints (`GET /recipe`) will now include the likes count and comments array
