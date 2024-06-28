import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

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
        <h3 className="appName">WorldCollection</h3>
        <div className="searchContainer">
          <input type="text" className="searchInput" placeholder='Search for' />
          <span className="searchIcon">&#128269;</span>
        </div>
        <div className="authLinks">
          {isAuthenticated ? (
            <>
              <div className="userProfile">
                <h3>Welcome {user.username} </h3>
                <div className="circle"></div>
                <button onClick={handleLogout} className="logoutButton">Logout</button>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="authLink">Log in</a>
              <a href="/register" className="authLink">Sign up</a>
            </>
          )}
        </div>
      </header>

      <div className="homeBody">
        <div className="shopSection">
          <div className="shopItem">
            <h2>Womenswear</h2>
            <button onClick={handleShopNowClick} className="shopNowButton">Shop now</button>
          </div>
          <div className="shopItem">
            <h2>Menswear</h2>
            <button onClick={handleShopNowClick} className="shopNowButton">Shop now</button>
          </div>
        </div>

        <div className="priceSection">
          <h3>Shop by Price</h3>
          <div className="priceItems">
            <div className="priceItem">Under $10</div>
            <div className="priceItem">Under $20</div>
            <div className="priceItem">Under $50</div>
          </div>
        </div>

        <div className="styleSection">
          <h3>Shop by Style</h3>
          <div className="styleItems">
            <div className="styleItem"></div>
            <div className="styleItem"></div>
            <div className="styleItem"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
