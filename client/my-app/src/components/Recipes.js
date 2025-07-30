import React, { useEffect, useState } from "react";
import "../styles/RecipeStyle.css";
import { Link } from "react-router-dom";
import "../styles/Searchbar.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for styling

const Recipes = ({ searchTerm }) => {
  const [recipes, setRecipes] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  // Helper function to get user info from token
  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      // Decode JWT token (simple base64 decode for the payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    getRecipes();
  }, []);

  const getRecipes = () => {
    fetch("http://localhost:2000/auth/recipe", {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch recipe data");
        }
        return response.json();
      })
      .then((data) => {
        setRecipes(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      // Confirm the deletion with the user
      if (window.confirm("Are you sure you want to delete this recipe?")) {
        // Send a DELETE request to the server
        const response = await fetch(
          `http://localhost:2000/auth/recipe/${recipeId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          toast.success("Recipe deleted successfully");

          setTimeout(() => {
            window.location = "/recipes";
          }, 4000);
        } else {
          getRecipes();
          window.location = "/recipes";
        }
      }
    } catch (error) {
      toast.error("An error occurred while deleting the recipe:", error);

      setTimeout(() => {
        window.location.href = "/recipes";
      }, 3000);
    }
  };

  const handleAddToFavorites = async (recipeId) => {
    try {
      // Send a POST request to the LikedList controller
      const response = await fetch(
        `http://localhost:2000/auth/likedRecipes/${recipeId}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Recipe added to favorites successfully");

        setTimeout(() => {
          window.location.href = "/favouriteRecipes";
        }, 4000);
      } else {
        const data = await response.json();
        if (data.error === "Recipe already exists in your favorites") {
          toast.warn("Recipe already exists in your favorites");
        } else {
          toast.error(data.error);
        }
      }
    } catch (error) {
      console.error("An error occurred while adding to favorites:", error);
    }
  };

  const SearchRecipes = async (e) => {
    try {
      if (e.target.value) {
        let Searchedrecipes = await fetch(
          `http://localhost:2000/auth/searchRecipes/${e.target.value}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        Searchedrecipes = await Searchedrecipes.json();

        if (!Searchedrecipes.message) {
          setRecipes(Searchedrecipes);
        } else {
          setRecipes([]);
        }
      } else {
        getRecipes();
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      SearchRecipes({ target: { value: searchTerm } });
    } else {
      getRecipes();
    }
    // eslint-disable-next-line
  }, [searchTerm]);

  const handleLike = async (id) => {
    try {
      const response = await fetch(`http://localhost:2000/auth/recipe/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update the recipe in the local state with the new like count
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe._id === id ? { ...recipe, likes: data.likes } : recipe
          )
        );
        toast.success("Recipe liked!");
      } else {
        toast.error("Failed to like recipe");
      }
    } catch (error) {
      console.error("Error liking recipe:", error);
      toast.error("Error liking recipe");
    }
  };

  const handleCommentInput = (id, value) => {
    setCommentInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddComment = async (id) => {
    if (!commentInputs[id]) return;

    const userInfo = getUserFromToken();
    const userName = userInfo?.email?.split('@')[0] || "Anonymous User";

    try {
      const response = await fetch(`http://localhost:2000/auth/recipe/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userName,
          text: commentInputs[id],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the recipe in the local state with the new comment
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe._id === id
              ? { ...recipe, comments: [...(recipe.comments || []), data.comment] }
              : recipe
          )
        );
        setCommentInputs((prev) => ({ ...prev, [id]: "" }));
        toast.success("Comment added!");
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    }
  };

  const handleShare = (recipe) => {
    const url =
      window.location.origin +
      `/recipeDetail?title=${encodeURIComponent(recipe.title)}&imageUrl=${encodeURIComponent(
        recipe.imageUrl
      )}&ingredients=${encodeURIComponent(recipe.ingredients.join("||"))}&instructions=${encodeURIComponent(
        recipe.instructions
      )}`;
    if (navigator.share) {
      navigator.share({ title: recipe.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.info("Recipe link copied to clipboard!");
    }
  };

  return (
    <div className="recipes-container">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        {/* User Profile Card */}
        <div className="sidebar-card user-profile">
          <div className="user-avatar">👨‍🍳</div>
          <div className="user-name">Chef Master</div>
          <div className="user-badge">🏆 Expert Chef</div>
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-number">24</span>
              <span className="stat-label">Recipes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">156</span>
              <span className="stat-label">Likes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">89</span>
              <span className="stat-label">Followers</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="sidebar-card">
          <h3>🚀 Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/addRecipe" className="quick-action-btn">
              ➕ Add New Recipe
            </Link>
            <button className="quick-action-btn secondary">
              🎲 Random Recipe
            </button>
            <button className="quick-action-btn secondary">
              📥 Import from URL
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="sidebar-card">
          <h3>🍽️ Categories</h3>
          <div className="category-list">
            <div className="category-item">
              <span className="category-icon">🥞</span>
              <span className="category-name">Breakfast</span>
              <span className="category-count">12</span>
            </div>
            <div className="category-item">
              <span className="category-icon">🍝</span>
              <span className="category-name">Lunch</span>
              <span className="category-count">18</span>
            </div>
            <div className="category-item">
              <span className="category-icon">🍖</span>
              <span className="category-name">Dinner</span>
              <span className="category-count">24</span>
            </div>
            <div className="category-item">
              <span className="category-icon">🍰</span>
              <span className="category-name">Desserts</span>
              <span className="category-count">15</span>
            </div>
            <div className="category-item">
              <span className="category-icon">🥗</span>
              <span className="category-name">Healthy</span>
              <span className="category-count">21</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Recipes Feed */}
      <div className="Recipes">
        {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <div key={recipe._id} className="Recipe feed-card">
            {/* Recipe Header with Avatar */}
            <div className="recipe-header">
              <div className="recipe-avatar">
                👨‍🍳
              </div>
              <div className="recipe-meta">
                <p className="recipe-author">Chef's Kitchen</p>
                <p className="recipe-time">2 hours ago</p>
              </div>
            </div>

            {/* Recipe Title */}
            <h2>{recipe.title}</h2>

            {/* Recipe Image */}
            <img src={recipe.imageUrl} alt={recipe.title} />

            {/* Social Actions */}
            <div className="feed-actions">
              <button
                className={`like-btn ${recipe.likes > 0 ? 'liked' : ''}`}
                onClick={() => handleLike(recipe._id)}
              >
                ❤️ {recipe.likes || 0}
              </button>
              <button className="comment-btn" onClick={() => {}}>
                💬 {recipe.comments?.length || 0}
              </button>
              <button
                className="share-btn"
                onClick={() => handleShare(recipe)}
              >
                📤 Share
              </button>
            </div>

            {/* Recipe Stats */}
            <div className="recipe-stats">
              {recipe.likes > 0 && (
                <span>{recipe.likes} {recipe.likes === 1 ? 'like' : 'likes'}</span>
              )}
            </div>
            {/* Comments Section */}
            <div className="feed-comments">
              <div className="comment-input-container">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInputs[recipe._id] || ""}
                  onChange={(e) =>
                    handleCommentInput(recipe._id, e.target.value)
                  }
                  className="comment-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment(recipe._id);
                    }
                  }}
                />
                <button
                  className="add-comment-btn"
                  onClick={() => handleAddComment(recipe._id)}
                  disabled={!commentInputs[recipe._id]?.trim()}
                >
                  Post
                </button>
              </div>

              {recipe.comments && recipe.comments.length > 0 && (
                <ul className="comments-list">
                  {recipe.comments.map((comment, i) => (
                    <li key={comment._id || i}>
                      <span className="comment-user">{comment.user}</span>
                      <span className="comment-text">{comment.text}</span>
                      <span className="comment-date">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Action Buttons */}
            <div className="recipe-actions">
              <button
                className="view-recipe-button"
                onClick={() => {
                  const params = new URLSearchParams({
                    title: recipe.title,
                    imageUrl: recipe.imageUrl,
                    ingredients: recipe.ingredients.join("||"),
                    instructions: recipe.instructions,
                  });
                  window.open(`/recipeDetail?${params.toString()}`, "_blank");
                }}
              >
                👁️ View Recipe
              </button>
              <button
                className="add-to-favorites-button"
                onClick={() => handleAddToFavorites(recipe._id)}
              >
                ⭐ Save
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteRecipe(recipe._id)}
              >
                🗑️ Delete
              </button>
            </div>

            <Link to={"/addRecipe"}>✨ Add more recipes</Link>
          </div>
        ))
      ) : (
        <div className="no-recipes">
          <h2>No Recipes Found</h2>
          <p>Start by adding your first delicious recipe!</p>
        </div>
      )}
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        {/* Trending Recipes */}
        <div className="sidebar-card">
          <h3>🔥 Trending Now</h3>
          <div className="trending-list">
            <div className="trending-item">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop"
                alt="Trending recipe"
                className="trending-image"
              />
              <div className="trending-content">
                <div className="trending-title">Spicy Pasta Arrabbiata</div>
                <div className="trending-meta">
                  <span>❤️ 45</span>
                  <span>💬 12</span>
                </div>
              </div>
            </div>
            <div className="trending-item">
              <img
                src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&h=100&fit=crop"
                alt="Trending recipe"
                className="trending-image"
              />
              <div className="trending-content">
                <div className="trending-title">Chocolate Lava Cake</div>
                <div className="trending-meta">
                  <span>❤️ 67</span>
                  <span>💬 23</span>
                </div>
              </div>
            </div>
            <div className="trending-item">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                alt="Trending recipe"
                className="trending-image"
              />
              <div className="trending-content">
                <div className="trending-title">Fresh Garden Salad</div>
                <div className="trending-meta">
                  <span>❤️ 34</span>
                  <span>💬 8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kitchen Tips */}
        <div className="sidebar-card">
          <h3>💡 Kitchen Tips</h3>
          <div className="tip-content">
            <div className="tip-title">Tip of the Day</div>
            <div className="tip-text">
              Always let your meat rest for 5-10 minutes after cooking to allow juices to redistribute for maximum flavor!
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="sidebar-card">
          <h3>📈 Recent Activity</h3>
          <div className="trending-list">
            <div className="trending-item">
              <div className="user-avatar" style={{width: '40px', height: '40px', fontSize: '1rem'}}>👩‍🍳</div>
              <div className="trending-content">
                <div className="trending-title">Sarah liked your recipe</div>
                <div className="trending-meta">
                  <span>2 hours ago</span>
                </div>
              </div>
            </div>
            <div className="trending-item">
              <div className="user-avatar" style={{width: '40px', height: '40px', fontSize: '1rem'}}>👨‍🍳</div>
              <div className="trending-content">
                <div className="trending-title">Mike added a comment</div>
                <div className="trending-meta">
                  <span>4 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Recipes;
