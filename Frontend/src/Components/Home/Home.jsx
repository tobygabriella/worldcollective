import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import AppHeader from '../Headers/AppHeader';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout} = useAuth();

  const handleShopNowClick = (category) => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    else {
      navigate(`/listings/category/${category}`);
    }
  };

  const handlePriceClick = (maxPrice) => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    else {
      navigate(`/listings/price/${maxPrice}`);
    }
  };

  const handleStyleClick = (subcategory) => {
      if (!isAuthenticated) {
        navigate("/login");
      } else {
        navigate(`/listings/subcategory/${subcategory}`);
      }
  };

  return (
    <div className="homeContainer">
      <header className="homeHeader">
        <AppHeader />
      </header>

      <div className="homeBody">
        <div className="shopSection">
          <div className="shopItem">
            <h2>Womenswear</h2>
            <button
              onClick={() => handleShopNowClick("womenswear")}
              className="shopNowButton"
            >
              Shop now
            </button>
          </div>
          <div className="shopItem">
            <h2>Menswear</h2>
            <button
              onClick={() => handleShopNowClick("menswear")}
              className="shopNowButton"
            >
              Shop now
            </button>
          </div>
        </div>

        <div className="priceSection">
          <h3>Shop by Price</h3>
          <div className="priceItems">
            <div className="priceItem" onClick={() => handlePriceClick(10)}>
              Under $10
            </div>
            <div className="priceItem" onClick={() => handlePriceClick(20)}>
              Under $20
            </div>
            <div className="priceItem" onClick={() => handlePriceClick(50)}>
              Under $50
            </div>
          </div>
        </div>

        <div className="styleSection">
          <h3>Shop by Style</h3>
          <div className="styleItems">
            <div
              className="styleItem"
              onClick={() => handleStyleClick("dresses")}
            >
              Dresses
            </div>
            <div
              className="styleItem"
              onClick={() => handleStyleClick("pants")}
            >
              Pants
            </div>
            <div
              className="styleItem"
              onClick={() => handleStyleClick("tshirts")}
            >
              T-shirts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
