import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import AppHeader from "../Headers/AppHeader";
import "./ListingDetails.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const ListingDetails = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`${API_KEY}/listings/${id}`);
        const data = await response.json();
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
      }
    };

    fetchListing();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_KEY}/listings/${id}`, {
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

  return (
    <div className="listingDetailsContainer">
      <AppHeader />
      {listing ? (
        <div className="listingDetails">
          <img
            src={listing.imageUrls[0]}
            alt={listing.title}
            className="listingImage"
          />
          <h2>{listing.title}</h2>
          <p>{listing.description}</p>
          <p>
            <strong>Price:</strong> ${listing.price}
          </p>
          <p>
            <strong>Category:</strong> {listing.category}
          </p>
          <p>
            <strong>Condition:</strong> {listing.condition}
          </p>
          {user?.id === listing.sellerId && (
            <div className="listingActions">
              <button onClick={handleDelete}>Delete Listing</button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ListingDetails;
