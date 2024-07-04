
import AppHeader from "../Headers/AppHeader";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import "./ProfileContent.css";

const ProfileContent = ({
  user,
  title,
  onFollow,
  onUnfollow,
  isFollowing,
  followersCount,
  followingCount,
}) => {


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
          <div className="initials">{initials}</div>
        </div>
        <div className="userInfo">
          <h2>{`${user.firstname} ${user.lastname}` || "Name of User"}</h2>
          <h4>@{user.username}</h4>
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
