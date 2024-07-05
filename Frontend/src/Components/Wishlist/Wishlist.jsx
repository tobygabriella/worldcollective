import React, { useEffect, useState } from "react";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const response = await fetch(`${API_KEY}/wishlist`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data);
        } else {
          console.error("Failed to fetch wishlist items");
        }
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
      }
    };

    fetchWishlistItems();
  }, []);

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
