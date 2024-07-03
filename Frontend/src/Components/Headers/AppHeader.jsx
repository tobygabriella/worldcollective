import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../Contexts/AuthContext';
import './AppHeader.css';

const AppHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
  };

   const handleSearch = (event) => {
     if (event.key === "Enter") {
       navigate(`/search?query=${searchQuery}`);
     }
   };

  const showIcons = location.pathname === '/userProfile';
  const showWelcome = location.pathname === '/';

  return (
    <header className="header">
      <Link to="/" className="appName">
        <h3>WorldCollection</h3>
      </Link>
      <div className="searchContainer">
        <input
          type="text"
          className="searchInput"
          placeholder="Search for"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
        <span
          className="searchIcon"
          onClick={() => navigate(`/search?query=${searchQuery}`)}
        >
          &#128269;
        </span>
      </div>
      <div className="authLinks">
        {isAuthenticated ? (
          <>
            {showWelcome && (
              <div className="userProfile">
                <h3>Welcome {user.username}</h3>
              </div>
            )}
            {showIcons && (
              <div className="icons">
                <i className="fas fa-bell"></i>
                <i className="fas fa-heart"></i>
                <Link to="/createListing">
                  <i className="fas fa-plus createListing"></i>
                </Link>
              </div>
            )}
            <Link to="/userProfile" className="circleLink">
              <div className="circle"></div>
            </Link>
            <button onClick={handleLogout} className="logoutButton">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="authLink">
              Log in
            </Link>
            <Link to="/register" className="authLink">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
