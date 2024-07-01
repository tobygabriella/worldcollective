import React, { useState, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import AppHeader from '../Headers/AppHeader';
import ListingItem from '../ListingItem/ListingItem';
import './UserProfile.css';

const UserProfile = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);

    const backendApi = import.meta.env.VITE_BACKEND_ADDRESS;

    useEffect(() => {
        const fetchListings = async () => {
          try {
            const response = await fetch(`${backendApi}/listings/user`, {
              method: 'GET',
              credentials: 'include',
            });
            if (response.ok) {
              const data = await response.json();
              setListings(data);
            } else {
              console.error('Failed to fetch listings');
            }
          } catch (error) {
            console.error('Error fetching listings:', error);
          }
        };

        fetchListings();
      }, []);

    return (
        <div className="profileContainer">
            <AppHeader />
            <div className="profileInfo">
                <img src={user?.profilePicture || 'default-profile.png'} alt="Profile" className="profilePicture" />
                <div className="userInfo">
                    <h2>{user?.name || 'Name of User'}</h2>
                    <h4>@{user?.username}</h4>
                    <p>Bio: {user?.bio || 'No bio available'}</p>
                </div>
            </div>
            <div className="userListings">
                <h2>Your Listings</h2>
                <div className="listingsGrid">
                    {listings.map(listing => (
                        <ListingItem
                        key={listing.id}
                        title={listing.title}
                        price={listing.price}
                        imageUrls={listing.imageUrls}
                        />
                    ))}
                </div>
            </div>
        </div>

    );
};

export default UserProfile;
