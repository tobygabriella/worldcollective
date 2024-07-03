import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const SearchResults = () => {
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const query = new URLSearchParams(location.search).get("query");
      if (!query) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_KEY}/search?query=${query}`);
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        setListings(data.listings);
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  return (
    <ListingsContainer title="Search Results" listings={listings}>
      {(listing) => <ListingItem key={listing.id} {...listing} />}
    </ListingsContainer>
  );
};

export default SearchResults;
