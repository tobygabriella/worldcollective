import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ListingItem.css";
import Countdown from "../Countdown/Countdown";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const ListingItem = ({
  id,
  title,
  price,
  imageUrls,
  currentBid,
  status,
  liked: initialLiked,
  isAuction,
  auctionEndTime,
  handleRemoveItem,
  cartItemId,
}) => {
  const [liked, setLiked] = useState(initialLiked);

  const toggleLike = async (e) => {
    e.preventDefault();
    try {
      if (liked) {
        // Remove from wishlist
        await fetch(`${API_KEY}/listings/${id}/like`, {
          method: "DELETE",
          credentials: "include",
        });
      } else {
        // Add to wishlist
        await fetch(`${API_KEY}/listings/${id}/like`, {
          method: "POST",
          credentials: "include",
        });
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  const handleRemoveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleRemoveItem(cartItemId);
  };

  const displayPrice = isAuction ? currentBid : price;

  return (
    <Link
      to={`/listings/${id}`}
      className={`listingItemLink ${isAuction ? "auction" : ""}`}
    >
      <div className="listingItem">
        <div className="imageWrapper">
          <img src={imageUrls[0]} alt={title} className="listingItemImage" />
          {status === "sold" && <div className="soldOverlay">SOLD</div>}
          {isAuction && auctionEndTime && (
            <div className="auctionOverlay">
              <Countdown endTime={auctionEndTime} />
            </div>
          )}
        </div>
        <div className="listingItemDetails">
          <h3 className="listingItemTitle">{title}</h3>
          <p className="listingItemPrice">${displayPrice}</p>
          <div className="listingItemButtons">
            <span
              onClick={toggleLike}
              className={`heartIcon ${liked ? "liked" : ""}`}
            >
              <i className={`fa${liked ? "s" : "r"} fa-heart`}></i>
            </span>
            {location.pathname === "/cart" && (
              <button onClick={handleRemoveClick} className="removeButton">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingItem;
