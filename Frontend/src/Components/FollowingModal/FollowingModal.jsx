import React, { useState, useEffect } from "react";
import "./FollowingModal.css";
const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const FollowingModal = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState("following");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await fetch(`${API_KEY}/users/${userId}/followers`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setFollowers(data);
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };

    const fetchFollowing = async () => {
      try {
        const response = await fetch(`${API_KEY}/users/${userId}/followings`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setFollowing(data);
      } catch (error) {
        console.error("Error fetching followings:", error);
      }
    };

    fetchFollowers();
    fetchFollowing();
  }, [userId]);

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <button className="closeButton" onClick={onClose}>
          ×
        </button>
        <div className="tabs">
          <button
            className={activeTab === "followers" ? "active" : ""}
            onClick={() => setActiveTab("followers")}
          >
            Followers
          </button>
          <button
            className={activeTab === "following" ? "active" : ""}
            onClick={() => setActiveTab("following")}
          >
            Following
          </button>
        </div>
        <div className="tabContent">
          {activeTab === "followers" ? (
            <ul>
              {followers.map((follower) => (
                <li key={follower.follower.id}>{follower.follower.username}</li>
              ))}
            </ul>
          ) : (
            <ul>
              {following.map((follow) => (
                <li key={follow.following.id}>{follow.following.username}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowingModal;
