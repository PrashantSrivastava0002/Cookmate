import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../App.css";
import "../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRotate } from "@fortawesome/free-solid-svg-icons";
import cookLogo from "../assets/chef-cooking.jpg";

const Navbar = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);

  const LogoutUser = () => {
    if (window.confirm("You wanna logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    } else {
      window.location.href = "/recipes";
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const auth = localStorage.getItem("token");

  const handleToggleMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav>
      <div className="nav-left">
        <FontAwesomeIcon
          icon={faBars}
          className="hamburger-icon"
          onClick={toggleMenu}
          style={isOpen ? { transform: "rotate(90deg)" } : {}}
        />
        <h2>
          <img src={cookLogo} alt="cook logo" />
          Cookmate
        </h2>
      </div>

      <div className="nav-search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search delicious recipes..."
          onChange={onSearch}
        />
      </div>

      <div className={`nav-right ${isOpen ? "open" : ""}`}>
        <ul>
          {auth ? (
            <>
              <li>
                <NavLink to="recipes" onClick={handleToggleMenu}>
                  🍽️ Recipes
                </NavLink>
              </li>
              <li>
                <NavLink to="/addRecipe" onClick={handleToggleMenu}>
                  ➕ Add Recipe
                </NavLink>
              </li>
              <li>
                <NavLink to="/favouriteRecipes" onClick={handleToggleMenu}>
                  ⭐ Favourites
                </NavLink>
              </li>
              <li>
                <NavLink to="login" onClick={LogoutUser}>
                  🚪 Logout
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="login">🔑 Login</NavLink>
              </li>
              <li>
                <NavLink to="signup">📝 SignUp</NavLink>
              </li>
              <li>
                <NavLink to="forgotPassword">❓ Forgot Password</NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
