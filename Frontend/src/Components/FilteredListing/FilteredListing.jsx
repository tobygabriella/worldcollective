import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import {getConditionName,getCategoryName,
} from "../utils/ListingInfoUtil.js";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const FilteredListings = () => {
  const { filterType, filterValue } = useParams();
  const [listings, setListings] = useState([]);
  const location = useLocation();

  useEffect(() => {

    const fetchListings = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const translatedParams = new URLSearchParams();
        queryParams.forEach((value, key) => {
          if (key === "condition") {
            translatedParams.set(key, getConditionName(value));
          } else if (key === "category") {
            translatedParams.set(key, getCategoryName(value));
          } else {
            translatedParams.set(key, value);
          }
        });

        const response = await fetch(
          `${API_KEY}/listings/${filterType}/${filterValue}?${translatedParams.toString()}`
        );
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, [filterType, filterValue, location.search]);

  return (
    <ListingsContainer
      title="Filtered Listings"
      listings={listings}
      showFilters={true}
    >
      {(listing) => <ListingItem key={listing.id} {...listing} />}
    </ListingsContainer>
  );
};

export default FilteredListings;
