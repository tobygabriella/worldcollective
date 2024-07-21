import React, { useEffect, useState } from "react";
import AppHeader from "../Headers/AppHeader";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import { getInitials } from "../utils/initialsUtils";
import { fetchListingsWithLiked } from "../utils/likeStatusUtil";
import useLoading from "../CustomHooks/useLoading.jsx";
import Loading from "../Loading/Loading.jsx";
import "./ProfileContent.css";
import ViewReviewModal from "../Review/ViewReviewModal.jsx";
import renderStars from "../utils/renderStars.jsx";

const ProfileContent = ({
  user,
  title,
  onFollow,
  onUnfollow,
  isFollowing,
  followersCount,
  followingCount,
}) => {
  const [listings, setListings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const initials = getInitials(user.firstname, user.lastname);

  useEffect(() => {
    const fetchListings = async () => {
      startLoading();
      try {
        const listingsWithLiked =
          await fetchListingsWithLiked(user.listings);
        setListings(listingsWithLiked);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        stopLoading();
      }
    };

    fetchListings();
  }, [user.listings]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="profileContainer">
      <AppHeader />
      <div className="profileInfo">
        <div className="profilePicture">
          <div className="initials">{initials}</div>
        </div>
        <div className="userInfo">
          <h2>{`${user.firstname} ${user.lastname}` || "Name of User"}</h2>
          <h4>@{user.username}</h4>
          <div className="rating" onClick={openModal}>
            {renderStars(user.averageRating)}
            <span>({user.reviewCount})</span>
          </div>
          <p>{followersCount} Followers</p>
          <p>{followingCount} Following</p>
          {onFollow &&
            onUnfollow &&
            (isFollowing ? (
              <button className="button" onClick={onUnfollow}>
                Unfollow
              </button>
            ) : (
              <button className="button" onClick={onFollow}>
                Follow
              </button>
            ))}
        </div>
      </div>
      <div className="userListings">
        <ListingsContainer
          title={title}
          listings={listings}
          showFilters={false}
        >
          {(listing) => <ListingItem key={listing.id} {...listing} />}
        </ListingsContainer>
      </div>
      {isModalOpen && <ViewReviewModal onClose={closeModal} userId={user.id} />}
    </div>
  );
};

export default ProfileContent;
