import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import {
  getConditionName,
  getCategoryName,
  getSubcategoryName,
} from "../utils/ListingInfoUtil.js";
import { fetchListingsWithStatusAndLiked } from "../utils/likeStatusUtil.js";
import { getInitials } from "../utils/initialsUtils.js";
import useLoading from "../CustomHooks/useLoading.jsx";
import Loading from "../Loading/Loading.jsx";
import "./SearchResults.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const SearchResults = () => {
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorState,
    resetError,
  } = useLoading();

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

      startLoading();
      resetError();

      try {
        const response = await fetch(
          `${API_KEY}/search?${translatedParams.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        const listingsWithStatusAndLiked =
          await fetchListingsWithStatusAndLiked(data.listings);
        setListings(listingsWithStatusAndLiked);
        setUsers(data.users);
      } catch (err) {
        setErrorState(err.message);
      } finally {
        stopLoading();
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
      {isLoading && <Loading />}
      {error && <p className="error">{error}</p>}
      <div className="users">
        {users.map((user) => (
          <div key={user.id} className="userItem">
            <Link to={`/users/${user.username}`}>
              <div className="initials">
                {getInitials(user.firstname, user.lastname)}
              </div>
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
