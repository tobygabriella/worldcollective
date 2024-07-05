import React,{ useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../Contexts/AuthContext';
import './AppHeader.css';
import { getInitials } from "../utils/initialsUtils";

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
  
  const initials = getInitials(user?.firstname, user?.lastname);


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
                <div className="iconWrapper" data-tooltip="Notification Center">
                  <i className="fas fa-bell"></i>
                </div>
                <div className="iconWrapper" data-tooltip="Wishlist">
                  <i className="fas fa-heart"></i>
                </div>
                <Link
                  to="/createListing"
                  className="iconWrapper"
                  data-tooltip="Add a Listing"
                >
                  <i className="fas fa-plus createListing"></i>
                </Link>
              </div>
            )}
            <Link to="/userProfile" className="circleLink">
              <div className="circle">
                <span className="circleInitials">{initials}</span>
              </div>
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
