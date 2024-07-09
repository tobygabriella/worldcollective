import React, { useState, useEffect } from "react";
import { useAuth } from "../Contexts/AuthContext";
import ProfileContent from "../ProfileContent/ProfileContent";
import { fetchCounts } from "../utils/followUtils.js";
import useLoading from "../CustomHooks/useLoading.jsx";
import Loading from "../Loading/Loading.jsx";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const UserProfile = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const {
    isLoading,
    startLoading,
    stopLoading,
  } = useLoading();

  useEffect(() => {
    const fetchListings = async () => {
      startLoading();
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
      } finally {
        stopLoading();
      }
    };

    fetchListings();
    fetchCounts(user.id, setFollowersCount, setFollowingCount);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ProfileContent
      user={{ ...user, listings }}
      title="Your Listings"
      followersCount={followersCount}
      followingCount={followingCount}
    />
  );
};

export default UserProfile;
