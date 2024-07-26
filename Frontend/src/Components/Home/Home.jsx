import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import AppHeader from "../Headers/AppHeader";
import "./Home.css";
import ListingItem from "../ListingItem/ListingItem";
import { fetchListingsWithLiked } from "../utils/likeStatusUtil.js";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated} = useAuth();

  const [auctionListings, setAuctionListings] = useState([]);

  useEffect(() => {
    const fetchAuctionListings = async () => {
      try {
        const response = await fetch(`${API_KEY}/listings/auctions/all`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const listingsWithLiked =
            await fetchListingsWithLiked(data.slice(0, 4));
          setAuctionListings(listingsWithLiked);
        }
      } catch (error) {
        console.error("Error fetching auction listings:", error);
      }
    };

    fetchAuctionListings();
  }, []);

  const handleSeeMoreClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/listings/auctions");
    }
  };

  const handleShopNowClick = (category) => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(`/listings/category/${category}`);
    }
  };

  const handlePriceClick = (maxPrice) => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
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

        <div className="auctionSection">
          <div className="auctionHeader">
            <h3>Auctions of the day</h3>
            <div className="seeMoreLink" onClick={handleSeeMoreClick}>
              See more
            </div>
          </div>
          <div className="auctionItems">
            {auctionListings.map((listing) => (
              <ListingItem key={listing.id} {...listing} isAuction />
            ))}
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
