import React from 'react';
import './ListingItem.css';


const ListingItem = ({ title, price, imageUrls}) => {
  return (
    <div className="listingItem">
      <img src={imageUrls[0]} alt={title} className="listingItemImage" />
      <h3 className="listingItemTitle">{title}</h3>
      <p className="listingItemPrice">${price}</p>
      <div className="listingItemButtons">
      </div>
    </div>
  );
};

export default ListingItem;
