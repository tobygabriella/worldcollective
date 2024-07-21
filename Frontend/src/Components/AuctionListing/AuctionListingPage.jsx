import React, { useState, useEffect } from "react";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import "./AuctionListingPage.css";
import { fetchListingsWithLiked } from "../utils/likeStatusUtil.js";
import Loading from "../Loading/Loading.jsx";
import useLoading from "../CustomHooks/useLoading.jsx";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const AuctionListingsPage = () => {
  const [auctionListings, setAuctionListings] = useState([]);
  const { startLoading, isLoading, stopLoading } = useLoading();

  useEffect(() => {
    startLoading();
    const fetchAuctionListings = async () => {
      try {
        const response = await fetch(`${API_KEY}/listings/auctions/all`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const listingsWithLiked = await fetchListingsWithLiked(data);
          setAuctionListings(listingsWithLiked);
        }
      } catch (error) {
        console.error("Error fetching auction listings:", error);
      } finally {
        stopLoading();
      }
    };

    fetchAuctionListings();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

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
