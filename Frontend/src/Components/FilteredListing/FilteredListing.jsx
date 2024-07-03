import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";


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
    <ListingsContainer title="Filtered Listings" listings={listings}>
      {(listing) => (
        <ListingItem key={listing.id} {...listing} />
      )}
    </ListingsContainer>
  );
};


export default FilteredListings;
