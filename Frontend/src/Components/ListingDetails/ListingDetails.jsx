import React, { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import AppHeader from "../Headers/AppHeader";
import "./ListingDetails.css";
import { getInitials } from "../utils/initialsUtils";
import PlaceBidModal from "../Bid/PlaceBidModal";
import Countdown from "../Countdown/Countdown";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

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

  const handleBuyNow = async () => {
    try {
      const response = await fetch(`${API_KEY}/create-payment-intent/single`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount: listing.price }),
      });

      if (response.ok) {
        const data = await response.json();
        navigate("/checkout", {
          state: { clientSecret: data.clientSecret, listing },
        });
      } else {
        console.error("Failed to create payment intent");
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const response = await fetch(`${API_KEY}/cart`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          listingId: listing.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        alert("Item added to cart!");
      } else if (response.status === 400) {
        const data = await response.json();
        if (data.error === "Item already in cart") {
          alert("Item is already in your cart.");
        } else {
          console.error("Failed to add item to cart");
        }
      } else {
        console.error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
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
                  <>
                    <button className="buyNowButton" onClick={handleBuyNow}>
                      Buy Now
                    </button>
                    <button
                      className="addToCartButton"
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </button>
                  </>
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
        <Elements stripe={stripePromise}>
          <PlaceBidModal
            onClose={() => setIsBidModalOpen(false)}
            listingId={listing.id}
            initialPrice={listing.price}
            isSeller={user?.id === listing.sellerId}
            auctionEndTime={listing.auctionEndTime}
          />
        </Elements>
      )}
    </div>
  );
};

export default ListingDetails;
