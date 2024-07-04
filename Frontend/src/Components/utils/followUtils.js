const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

export const handleFollow = async (
  userId,
  setIsFollowing,
  fetchCounts
) => {
  try {
    const response = await fetch(`${API_KEY}/users/${userId}/follow`, {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      setIsFollowing(true);

      fetchCounts();
    }
  } catch (err) {
    console.error("Error following user:", err);
  }
};

export const handleUnfollow = async (
  userId,
  setIsFollowing,
  fetchCounts
) => {
  try {
    const response = await fetch(`${API_KEY}/users/${userId}/unfollow`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) {
      setIsFollowing(false);
      fetchCounts();
    }
  } catch (err) {
    console.error("Error unfollowing user:", err);
  }
};

export const fetchCounts = async (
  userId,
  setFollowersCount,
  setFollowingCount
) => {
  try {
    const followersResponse = await fetch(
      `${API_KEY}/users/${userId}/followers`
    );
    const followersData = await followersResponse.json();
    setFollowersCount(followersData.length);

    const followingsResponse = await fetch(
      `${API_KEY}/users/${userId}/followings`
    );
    const followingsData = await followingsResponse.json();
    setFollowingCount(followingsData.length);
  } catch (error) {
    console.error("Error fetching counts:", error);
  }
};

export const checkFollowingStatus = async (
  currentUserId,
  userId,
  setIsFollowing
) => {
  try {
    const response = await fetch(
      `${API_KEY}/users/${currentUserId}/followings`
    );
    const data = await response.json();
    const isUserFollowing = data.some(
      (follow) => follow.followingId === userId
    );
    setIsFollowing(isUserFollowing);
  } catch (err) {
    console.error("Error checking following status:", err);
  }
};
