import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout} = useAuth();

  const handleShopNowClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="homeContainer">
      <header className="homeHeader">
        <div className="appName">World Collection</div>
        {isAuthenticated && user && (
          <div className="userProfile">
            <h3>Hi @{user.username}</h3>
            <img src={user.profilePicture || 'default-profile.png'} alt="Profile" className="profilePicture" />
            <button onClick={handleLogout} className="logoutButton">Logout</button>
          </div>
        )}
      </header>
      <div className="homeBody">
        <h1>Welcome to World Collection</h1>
        <button onClick={handleShopNowClick} className="shopNowButton">
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default Home;
