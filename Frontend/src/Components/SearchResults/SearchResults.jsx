import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import {
  getConditionName,
  getCategoryName,
  getSubcategoryName,
} from "../utils/ListingInfoUtil.js";
import "./SearchResults.css"

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const SearchResults = () => {
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const searchParams = new URLSearchParams(location.search);
      const query = searchParams.get("query");
      if (!query) return;

      // Translate filter values for the backend request
      const translatedParams = new URLSearchParams();
      translatedParams.set("query", query);
      searchParams.forEach((value, key) => {
        if (key !== "query") {
          if (key === "condition") {
            translatedParams.set(key, getConditionName(value));
          } else if (key === "category") {
            translatedParams.set(key, getCategoryName(value));
          } else if (key === "subcategory") {
            translatedParams.set(key, getSubcategoryName(value));
          } else {
            translatedParams.set(key, value);
          }
        }
      });

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_KEY}/search?${translatedParams.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        setListings(data.listings);
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  return (
    <>
      <ListingsContainer
        title="Search Results"
        listings={listings}
        showFilters={true}
      >
        {(listing) => <ListingItem key={listing.id} {...listing} />}
      </ListingsContainer>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <div className="users">
        {users.map((user) => (
          <div key={user.id} className="userItem">
            <Link to={`/users/${user.username}`}>
              <img
                src={user.profilePicture || "default-profile.png"}
                alt={user.username}
                className="profilePicture"
              />
            </Link>
            <h3>
              <Link to={`/users/${user.username}`}>@{user.username}</Link>
            </h3>
          </div>
        ))}
      </div>
    </>
  );
};

export default SearchResults;
