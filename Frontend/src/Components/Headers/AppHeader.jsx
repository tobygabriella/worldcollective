import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import "./AppHeader.css";
import { getInitials } from "../utils/initialsUtils";
import { useSocket } from "../Contexts/SocketContext";
import AutocompleteSearch from "../AutoCompleteSearch/AutocompleteSearch.jsx";

const AppHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useSocket();
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

  const handleNotificationsClick = async () => {
    navigate("/notifications");
  };

  const handleCartClick = async () => {
    navigate("/cart");
  };

  const showWelcome = location.pathname === "/";
  const initials = getInitials(user?.firstname, user?.lastname);

  return (
    <header className="header">
      <Link to="/" className="appName">
        <h3>WorldCollection</h3>
      </Link>
      <div className="searchContainer">
        <AutocompleteSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
            <div className="icons">
              <div
                className="iconWrapper"
                data-tooltip="Notification Center"
                onClick={handleNotificationsClick}
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="notificationBadge">{unreadCount}</span>
                )}
              </div>
              <div
                className="iconWrapper"
                data-tooltip="Shopping Cart"
                onClick={handleCartClick}
              >
                <i className="fas fa-shopping-cart"></i>
              </div>
              <Link
                to="/wishlist"
                className="iconWrapper"
                data-tooltip="Wishlist"
              >
                <i className="fas fa-heart"></i>
              </Link>
              <Link
                to="/createListing"
                className="iconWrapper"
                data-tooltip="Add a Listing"
              >
                <i className="fas fa-plus createListing"></i>
              </Link>
            </div>

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
