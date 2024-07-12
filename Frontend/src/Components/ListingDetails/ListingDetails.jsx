import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import AppHeader from "../Headers/AppHeader";
import "./ListingDetails.css";

const ListingDetails = () => {
  const { listing } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();

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
            <strong>${listing.price}</strong>
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
              <button>Edit Listing</button>
              <button onClick={handleDelete}>Delete Listing</button>
            </div>
          ) : (
            listing.status !== "sold" && (
              <button className="buyNowButton" onClick={handleBuyNow}>
                Buy Now
              </button>
            )
          )}
          <div className="sellerInfo">
            <img
              src="default-profile.png"
              alt={user?.username}
              className="sellerProfilePicture"
            />
            <div>
              <p>{user?.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
