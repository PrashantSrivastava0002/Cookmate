const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/middleware");

const {
  getAllRecipes,
  createRecipe,
  deleteRecipe,
  LikedList,
  getAllLikedRecipes,
  removeFromLikedRecipes,
  searchRecipes,
  likeRecipe,
  unlikeRecipe,
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/RecipeController");

router.post("/recipe", createRecipe);
router.get("/recipe", verifyToken, getAllRecipes);
router.get("/likedRecipes", getAllLikedRecipes);
router.delete("/recipe/:id", deleteRecipe);
router.post("/likedRecipes/:id", LikedList);
router.delete("/removeLiked/:id", removeFromLikedRecipes);
router.get("/searchRecipes/:key", searchRecipes);

// Like and unlike routes
router.post("/recipe/:id/like", likeRecipe);
router.post("/recipe/:id/unlike", unlikeRecipe);

// Comment routes
router.post("/recipe/:id/comment", addComment);
router.get("/recipe/:id/comments", getComments);
router.delete("/recipe/:recipeId/comment/:commentId", deleteComment);

module.exports = router;
