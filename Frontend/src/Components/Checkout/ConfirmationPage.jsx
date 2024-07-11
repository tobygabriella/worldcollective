import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "../Headers/AppHeader";
import ReviewModal from "../Review/CreateReviewModal";
import "./ConfirmationPage.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId, sellerId } = location.state || {};
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleBackToListings = () => {
    navigate("/userProfile");
  };

  const handleLeaveReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (
    review,
    setSuccessMessage,
    setErrorMessage
  ) => {
    try {
      const response = await fetch(`${API_KEY}/listings/${listingId}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...review, sellerId }),
      });

      if (response.ok) {
        setSuccessMessage("Review submitted successfully");
      } else {
        setErrorMessage("Failed to submit review");
      }
    } catch (error) {
      setErrorMessage("Error submitting review");
    }
  };

  return (
    <div className="confirmationPageContainer">
      <AppHeader />
      <div className="confirmationContent">
        <h2>Thank you for your purchase!</h2>
        <p>Your transaction was successful.</p>
        <button onClick={handleBackToListings}>Back to your profile</button>
        <button onClick={handleLeaveReview}>Leave a Review</button>
      </div>
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default ConfirmationPage;
