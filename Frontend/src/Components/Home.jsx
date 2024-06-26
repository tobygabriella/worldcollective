import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleShopNowClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  };

  return (
    <div className="homeContainer">
      <header className="homeHeader">
        <div className="appName">World Collection</div>
        {isAuthenticated && (
          <div className="userProfile">
            <img src="" alt="Profile" className="profilePicture" />
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
