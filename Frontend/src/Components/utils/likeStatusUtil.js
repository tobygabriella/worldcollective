const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

export const fetchListingsWithLiked = async (listings) => {
  const listingsWithStatusAndLiked = await Promise.all(
    listings.map(async (listing) => {
      const likedResponse = await fetch(
        `${API_KEY}/listings/${listing.id}/like-status`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const likedData = await likedResponse.json();
      return {
        ...listing,
        liked: likedData.isLiked,
      };
    })
  );
  return listingsWithStatusAndLiked;
};
