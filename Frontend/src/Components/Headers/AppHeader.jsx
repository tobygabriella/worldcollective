import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import './AppHeader.css';

const AppHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const showIcons = location.pathname === '/userProfile';
  const showWelcome = location.pathname === '/';

  return (
    <header className="header">
      <Link to="/" className="appName">
        <h3>WorldCollection</h3>
      </Link>
      <div className="searchContainer">
        <input type="text" className="searchInput" placeholder="Search for" />
        <span className="searchIcon">&#128269;</span>
      </div>
      <div className="authLinks">
      {isAuthenticated ? (
          <>
            {showWelcome && (
              <div className="userProfile">
                <h3>Welcome {user.username}</h3>
                <Link to="/userProfile" className="circleLink">
                  <div className="circle"></div>
                </Link>
              </div>
            )}
            {showIcons && (
              <div className="icons">
                <i className="fas fa-bell"></i>
                <i className="fas fa-heart"></i>
                <i className="fas fa-plus createListing"></i>
              </div>
            )}
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
