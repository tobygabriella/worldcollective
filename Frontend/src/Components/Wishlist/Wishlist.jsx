import React, { useEffect, useState } from "react";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import useLoading from "../CustomHooks/useLoading.jsx";
import { fetchListingsWithStatusAndLiked } from "../utils/likeStatusUtil.js";
import Loading from "../Loading/Loading.jsx";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchWishlistItems = async () => {
      startLoading();
      try {
        const response = await fetch(`${API_KEY}/wishlist`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const itemsWithStatusAndLiked = await fetchListingsWithStatusAndLiked(
            data
          );
          setWishlistItems(itemsWithStatusAndLiked);
        } else {
          console.error("Failed to fetch wishlist items");
        }
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
      } finally {
        stopLoading();
      }
    };
    fetchWishlistItems();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ListingsContainer
      title="Wishlist"
      listings={wishlistItems}
      showFilters={false}
    >
      {(listing) => <ListingItem key={listing.id} {...listing} />}
    </ListingsContainer>
  );
};

export default Wishlist;
