import React from "react";
import "../styles/RecipeStyle.css";

const RecipeDetail = ({ location }) => {
  // For react-router-dom v6, use useLocation and useSearchParams
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  const imageUrl = params.get("imageUrl");
  const ingredients = params.get("ingredients")?.split("||") || [];
  const instructions = params.get("instructions") || "";

  return (
    <div className="RecipeDetailPage" style={{ maxWidth: 600, margin: "3rem auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: 32 }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>{title}</h2>
      <img src={imageUrl} alt={title} style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 12, marginBottom: 24 }} />
      <h3 style={{ color: "#4299e1", marginBottom: 8 }}>Ingredients:</h3>
      <ul style={{ marginBottom: 24 }}>
        {ingredients.map((ingredient, idx) => (
          <li key={idx}>{ingredient}</li>
        ))}
      </ul>
      <h3 style={{ color: "#4299e1", marginBottom: 8 }}>Instructions:</h3>
      <div style={{ background: "#f4f8fb", borderRadius: 8, padding: 16 }}>
        {instructions.split("\n").map((step, idx) => (
          <p key={idx} style={{ marginBottom: 8 }}>{step}</p>
        ))}
      </div>
    </div>
  );
};

export default RecipeDetail;
