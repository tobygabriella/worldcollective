import React from "react";
import { Link } from "react-router-dom";
import "./ListingItem.css";

const ListingItem = ({ id, title, price, imageUrls }) => {
  return (
    <Link to={`/listings/${id}`} className="listingItemLink">
      <div className="listingItem">
        <img src={imageUrls[0]} alt={title} className="listingItemImage" />
        <div className="listingItemDetails">
          <h3 className="listingItemTitle">{title}</h3>
          <p className="listingItemPrice">${price}</p>
          <div className="listingItemButtons"></div>
        </div>
      </div>
    </Link>
  );
};

export default ListingItem;
