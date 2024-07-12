const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

export const fetchListingsWithStatusAndLiked = async (listings) => {
  const listingsWithStatusAndLiked = await Promise.all(
    listings.map(async (listing) => {
      const statusResponse = await fetch(`${API_KEY}/listings/${listing.id}`);
      const statusData = await statusResponse.json();
      const likedResponse = await fetch(
        `${API_KEY}/listings/${listing.id}/like-status`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const likedData = await likedResponse.json();
      return {
        ...listing,
        status: statusData.status,
        liked: likedData.isLiked,
      };
    })
  );
  return listingsWithStatusAndLiked;
};
