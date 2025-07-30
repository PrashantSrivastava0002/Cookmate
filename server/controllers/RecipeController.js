const Recipe = require("../Schema/RecipeSchema");
const Liked = require("../Schema/LikedRecipeSchema");

const createRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, imageUrl } = req.body;

    const newRecipe = await Recipe.create({
      title,
      ingredients,
      instructions,
      imageUrl,
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const allRecipes = await Recipe.find();

    res.status(200).json(allRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;

    const deletedRecipe = await Recipe.deleteOne({ _id: recipeId });

    if (!deletedRecipe.deletedCount) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipes = await Recipe.find();

    res.status(200).json({ message: "Recipe deleted successfully", recipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const LikedList = async (req, res) => {
  try {
    // Find the recipe by ID in the database
    let recipe = await Recipe.findOne({ _id: req.params.id });

    // Check if the recipe exists in the user's favorites
    const existingFavorite = await Liked.findOne({ title: recipe.title });

    if (existingFavorite) {
      // Recipe already exists in favorites
      return res
        .status(400)
        .json({ error: "Recipe already exists in your favorites" });
    } else {
      // Create a new favorite recipe entry
      const { title, instructions, imageUrl, ingredients } = recipe;
      const newFavorite = await Liked.create({
        title,
        instructions,
        imageUrl,
        ingredients,
      });

      // Respond with the newly added favorite recipe
      return res.status(201).json({ favoriteRecipe: newFavorite });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error in Liked:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};

const getAllLikedRecipes = async (req, res) => {
  try {
    const allLikedRecipes = await Liked.find();

    res.status(200).json(allLikedRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeFromLikedRecipes = async (req, res) => {
  try {
    const recipeId = req.params.id;

    // Find and delete the liked recipe by ID
    const deletedLikedRecipe = await Liked.deleteOne({ _id: recipeId });

    if (!deletedLikedRecipe.deletedCount) {
      return res.status(404).json({ error: "Liked recipe not found" });
    }

    res.status(200).json({ message: "Recipe removed from liked recipes" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const searchRecipes = async (req, res) => {
  const searchKey = req.params.key;

  try {
    // Use a case-insensitive regular expression to search for recipes by title
    const recipes = await Recipe.find({
      title: { $regex: new RegExp(searchKey, "i") },
    });

    // If no matching recipes found, return a meaningful message
    if (recipes.length === 0) {
      return res.status(404).json({ message: "No recipes found" });
    }

    // If matching recipes found, return them in the response
    res.status(200).json(recipes);
  } catch (error) {
    // Handle any server error and return a proper error response
    console.error("Error searching recipes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Like a recipe
const likeRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;

    // Find the recipe and increment the likes count
    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json({
      message: "Recipe liked successfully",
      likes: recipe.likes
    });
  } catch (error) {
    console.error("Error liking recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unlike a recipe
const unlikeRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;

    // Find the recipe and decrement the likes count (but not below 0)
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    if (recipe.likes > 0) {
      recipe.likes -= 1;
      await recipe.save();
    }

    res.status(200).json({
      message: "Recipe unliked successfully",
      likes: recipe.likes
    });
  } catch (error) {
    console.error("Error unliking recipe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a comment to a recipe
const addComment = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { user, text } = req.body;

    if (!user || !text) {
      return res.status(400).json({ error: "User and text are required" });
    }

    // Find the recipe and add the comment
    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      {
        $push: {
          comments: {
            user,
            text,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(201).json({
      message: "Comment added successfully",
      comment: recipe.comments[recipe.comments.length - 1],
      totalComments: recipe.comments.length
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all comments for a recipe
const getComments = async (req, res) => {
  try {
    const recipeId = req.params.id;

    const recipe = await Recipe.findById(recipeId).select('comments');

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json({
      comments: recipe.comments,
      totalComments: recipe.comments.length
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a comment from a recipe
const deleteComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;

    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json({
      message: "Comment deleted successfully",
      totalComments: recipe.comments.length
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllRecipes,
  createRecipe,
  deleteRecipe,
  getAllLikedRecipes,
  LikedList,
  removeFromLikedRecipes,
  searchRecipes,
  likeRecipe,
  unlikeRecipe,
  addComment,
  getComments,
  deleteComment,
};
