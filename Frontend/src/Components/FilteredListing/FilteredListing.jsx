import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ListingItem from "../ListingItem/ListingItem";
import AppHeader from "../Headers/AppHeader";
// import "./FilteredListings.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const FilteredListings = () => {
  const { filterType, filterValue } = useParams();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(
          `${API_KEY}/listings/${filterType}/${filterValue}`
        );
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, [filterType, filterValue]);

  return (
    <div className="filteredListingsContainer">
      <AppHeader />
      <div className="filteredListingsGrid">
        {listings.map((listing) => (
          <ListingItem
            key={listing.id}
            id={listing.id}
            title={listing.title}
            price={listing.price}
            imageUrls={listing.imageUrls}
          />
        ))}
      </div>
    </div>
  );
};

export default FilteredListings;
