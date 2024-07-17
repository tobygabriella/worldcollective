import React, { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import AppHeader from "../Headers/AppHeader";
import "./ListingDetails.css";
import { getInitials } from "../utils/initialsUtils";
import PlaceBidModal from "../Bid/PlaceBidModal";
import Countdown from "../Countdown/Countdown";

const ListingDetails = () => {
  const { listing } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  if (!listing) {
    return;
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_KEY}/listings/${listing.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        navigate("/userProfile");
      } else {
        console.error("Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  const handleBuyNow = () => {
    navigate(`buy`);
  };

  const initials = getInitials(
    listing.seller.firstname,
    listing.seller.lastname
  );

  const handlePlaceBid = () => {
    setIsBidModalOpen(true);
  };

  const isAuctionEnded = new Date() > new Date(listing.auctionEndTime);

  const displayPrice = listing.isAuction ? listing.currentBid : listing.price;

  return (
    <div className="listingDetailsContainer">
      <AppHeader />
      <div className="listingDetails">
        <div className="listingImages">
          {listing.imageUrls.map((url, index) => (
            <div className="imageWrapper" key={index}>
              <img
                key={index}
                src={url}
                alt={listing.title}
                className="listingImage"
              />
              {listing.status === "sold" && (
                <div className="soldOverlay">SOLD</div>
              )}
            </div>
          ))}
        </div>
        <div className="listingInfo">
          <h2>
            <strong>${displayPrice}</strong>
          </h2>
          <h2>{listing.title}</h2>
          <p>{listing.description}</p>
          <p>
            <strong>Category:</strong> {listing.category}
          </p>
          <p>
            <strong>Condition:</strong> {listing.condition}
          </p>
          {user?.id === listing.sellerId ? (
            <div className="listingActions">
              {listing.isAuction && (
                <button onClick={handlePlaceBid}>View All Bids</button>
              )}
              {!listing.isAuction && (
                <button onClick={handleDelete}>Delete Listing</button>
              )}
            </div>
          ) : (
            listing.status !== "sold" && (
              <>
                {listing.isAuction ? (
                  !isAuctionEnded ? (
                    <>
                      <button
                        className="placeBidButton"
                        onClick={handlePlaceBid}
                      >
                        Place a Bid
                      </button>
                      {listing.auctionEndTime && (
                        <div className="auctionCountdown">
                          <Countdown endTime={listing.auctionEndTime} />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="error">The auction has ended.</p>
                  )
                ) : (
                  <button className="buyNowButton" onClick={handleBuyNow}>
                    Buy Now
                  </button>
                )}
              </>
            )
          )}
          {listing.seller && (
            <div className="sellerInfo">
              <Link to={`/users/${listing.seller.username}`}>
                <div className="circle">
                  <span className="circleInitials">{initials}</span>
                </div>
              </Link>
              <div>
                <Link to={`/users/${listing.seller.username}`}>
                  @{listing.seller.username}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      {isBidModalOpen && (
        <PlaceBidModal
          onClose={() => setIsBidModalOpen(false)}
          listingId={listing.id}
          initialPrice={listing.price}
          isSeller={user?.id === listing.sellerId}
          auctionEndTime={listing.auctionEndTime}
        />
      )}
    </div>
  );
};

export default ListingDetails;
