import React from "react";
import AppHeader from "../Headers/AppHeader";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import "./ProfileContent.css";

const ProfileContent = ({ user, title }) => {

      const getInitials = (firstName, lastName) => {
        if (!firstName && !lastName) return "";
        return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
      };

    const initials = getInitials(user.firstname, user.lastname);

 return (
   <div className="profileContainer">
     <AppHeader />
     <div className="profileInfo">
       <div className="profilePicture">
         {user.profilePicture ? (
           <img src={user.profilePicture} alt="Profile" />
         ) : (
           <div className="initials">{initials}</div>
         )}
       </div>
       <div className="userInfo">
         <h2>{`${user.firstname} ${user.lastname}` || "Name of User"}</h2>
         <h4>@{user.username}</h4>
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
