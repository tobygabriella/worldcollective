import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ListingItem.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const ListingItem = ({
  id,
  title,
  price,
  imageUrls,
  status,
  liked: initialLiked,
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

  return (
    <Link to={`/listings/${id}`} className="listingItemLink">
      <div className="listingItem">
        <div className="imageWrapper">
          <img src={imageUrls[0]} alt={title} className="listingItemImage" />
          {status === "sold" && <div className="soldOverlay">SOLD</div>}
        </div>
        <div className="listingItemDetails">
          <h3 className="listingItemTitle">{title}</h3>
          <p className="listingItemPrice">${price}</p>
          <div className="listingItemButtons">
            <span
              onClick={toggleLike}
              className={`heartIcon ${liked ? "liked" : ""}`}
            >
              <i className={`fa${liked ? "s" : "r"} fa-heart`}></i>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingItem;
