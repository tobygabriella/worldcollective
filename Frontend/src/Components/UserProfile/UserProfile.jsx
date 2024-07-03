import React, { useState, useEffect } from "react";
import { useAuth } from "../Contexts/AuthContext";
import AppHeader from "../Headers/AppHeader";
import ListingItem from "../ListingItem/ListingItem";
import "./UserProfile.css";
import ListingsContainer from "../ListingsContainer/ListingsContainer";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const UserProfile = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch(`${API_KEY}/listings/user`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setListings(data);
        } else {
          console.error("Failed to fetch listings");
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="profileContainer">
      <AppHeader />
      <div className="profileInfo">
        <img
          src={user?.profilePicture || "default-profile.png"}
          alt="Profile"
          className="profilePicture"
        />
        <div className="userInfo">
          <h2>{user?.name || "Name of User"}</h2>
          <h4>@{user?.username}</h4>
          <p>Bio: {user?.bio || "No bio available"}</p>
        </div>
      </div>
      <div className="userListings">
        <ListingsContainer title="Your Listings" listings={listings}>
          {(listing) => <ListingItem key={listing.id} {...listing} />}
        </ListingsContainer>
      </div>
    </div>
  );
};

export default UserProfile;
