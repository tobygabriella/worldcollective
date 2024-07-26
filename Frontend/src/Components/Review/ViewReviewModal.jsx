import React, { useEffect, useState } from "react";
import "./ViewReviewModal.css";
import renderStars from "../utils/renderStars.jsx";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const ViewReviewModal = ({ onClose, userId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_KEY}/users/${userId}/reviews`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error("Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [userId]);

  return (
    <div className="reviewsModalOverlay">
      <div className="reviewsModal">
        <button className="closeButton" onClick={onClose}>
          &times;
        </button>
        <h2>Reviews</h2>
        <div className="reviewsList">
          {reviews.map((review) => (
            <div key={review.id} className="reviewItem">
              <img
                src={review.listing.imageUrls[0]}
                alt="Listing"
                className="reviewListingImage"
              />
              <div className="reviewText">
                <h4>@{review.reviewer.username}</h4>
                <div className="reviewRating">{renderStars(review.rating)}</div>
                <p>{review.content}</p>
                <p className="reviewTime">{review.timeAgo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewReviewModal;
