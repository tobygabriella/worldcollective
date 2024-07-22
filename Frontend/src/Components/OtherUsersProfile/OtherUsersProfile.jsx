import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileContent from "../ProfileContent/ProfileContent";
import { useAuth } from "../Contexts/AuthContext";
import Loading from "../Loading/Loading.jsx";
import {
  handleFollow,
  handleUnfollow,
  fetchCounts,
  checkFollowingStatus,
} from "../utils/followUtils.js";
import useLoading from "../CustomHooks/useLoading.jsx";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const OtherUsersProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
const {
  isLoading,
  error,
  startLoading,
  stopLoading,
  setErrorState,
  resetError,
} = useLoading();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      startLoading();
      resetError();
      try {
        const response = await fetch(`${API_KEY}/users/${username}`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setErrorState(err.message);
      } finally {
        stopLoading();
      }
    };

    fetchUser();
  }, [username]);

  useEffect(() => {
    if (currentUser && user) {
      checkFollowingStatus(currentUser.id, user.id, setIsFollowing);
    }
  }, [currentUser, user]);

  useEffect(() => {
    if (user) {
      fetchCounts(user.id, setFollowersCount, setFollowingCount);
    }
  }, [user]);

  const followUser = () =>
    handleFollow(user.id, setIsFollowing, () =>
      fetchCounts(user.id, setFollowersCount, setFollowingCount)
    );
  const unfollowUser = () =>
    handleUnfollow(user.id, setIsFollowing, () =>
      fetchCounts(user.id, setFollowersCount, setFollowingCount)
    );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading user details...</div>;
  }

  return (
    <ProfileContent
      user={user}
      title="User Listings"
      onFollow={followUser}
      onUnfollow={unfollowUser}
      isFollowing={isFollowing}
      followersCount={followersCount}
      followingCount={followingCount}
    />
  );
};

export default OtherUsersProfile;
