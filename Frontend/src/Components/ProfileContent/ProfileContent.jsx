import React from "react";
import AppHeader from "../Headers/AppHeader";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import "./ProfileContent.css";

const ProfileContent = ({ user, title }) => {
  return (
    <div className="profileContainer">
      <AppHeader />
      <div className="profileInfo">
        <img
          src={user.profilePicture || "default-profile.png"}
          alt="Profile"
          className="profilePicture"
        />
        <div className="userInfo">
          <h2>{user.name || "Name of User"}</h2>
          <h4>@{user.username}</h4>
          <p>Bio: {user.bio || "No bio available"}</p>
        </div>
      </div>
      <div className="userListings">
        <ListingsContainer
          title={title}
          listings={user.listings}
          showFilters={false}
        >
          {(listing) => <ListingItem key={listing.id} {...listing} />}
        </ListingsContainer>
      </div>
    </div>
  );
};

export default ProfileContent;
