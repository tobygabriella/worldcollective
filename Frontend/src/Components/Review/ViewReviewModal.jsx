import React, { useEffect, useState } from "react";
import "./ViewReviewModal.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const ViewReviewModal = ({ isOpen, onClose, userId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!isOpen) return;
      try {
        const response = await fetch(`${API_KEY}/users/${userId}/reviews`);
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
  }, [isOpen, userId]);

  if (!isOpen) return null;

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
                <div className="reviewRating">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={`star ${
                        index < review.rating ? "filled" : ""
                      }`}
                    >
                      &#9733;
                    </span>
                  ))}
                </div>
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
