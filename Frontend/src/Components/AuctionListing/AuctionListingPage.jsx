import React, { useState, useEffect } from "react";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import "./AuctionListingPage.css";
import { fetchListingsWithStatusAndLiked } from "../utils/likeStatusUtil.js";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const AuctionListingsPage = () => {
  const [auctionListings, setAuctionListings] = useState([]);

  useEffect(() => {
    const fetchAuctionListings = async () => {
      try {
        const response = await fetch(`${API_KEY}/listings/auctions/all`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const listingsWithStatusAndLiked =
            await fetchListingsWithStatusAndLiked(data);
          setAuctionListings(listingsWithStatusAndLiked);
        }
      } catch (error) {
        console.error("Error fetching auction listings:", error);
      }
    };

    fetchAuctionListings();
  }, []);

  return (
    <div className="auctionListingsPage">
      <ListingsContainer
        title="All Auctions"
        listings={auctionListings}
        showFilters={false}
      >
        {(listing) => <ListingItem key={listing.id} {...listing} />}
      </ListingsContainer>
    </div>
  );
};

export default AuctionListingsPage;
