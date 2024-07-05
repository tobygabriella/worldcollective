import React from "react";
import AppHeader from "../Headers/AppHeader";
import "./ListingsContainer.css";

const ListingsContainer = ({ title, listings, children }) => {
  return (
    <div className="listingsContainer">
      <AppHeader />
      <div className="listingsContent">
        <h2>{title}</h2>
        <div className="filters">
          <button>Category</button>
          <button>Brand</button>
          <button>Price</button>
          <button>Condition</button>
        </div>
        <div className="listingsGrid">
          {listings.map((listing) => (
            <div className="listingItemWrapper" key={listing.id}>
              {children(listing)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListingsContainer;
