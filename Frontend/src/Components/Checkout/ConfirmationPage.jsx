import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "../Headers/AppHeader";
import ReviewModal from "../Review/CreateReviewModal";
import "./ConfirmationPage.css";
import useReview from "../CustomHooks/useReview";

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId, sellerId } = location.state || {};
  const {
    isReviewModalOpen,
    openReviewModal,
    closeReviewModal,
    handleReviewSubmit,
    successMessage,
    errorMessage,
  } = useReview();

  const handleBackToListings = () => {
    navigate("/userProfile");
  };

  const handleLeaveReview = () => {
    openReviewModal();
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
        onClose={closeReviewModal}
        successMessage={successMessage}
        errorMessage={errorMessage}
        onSubmit={(review) => handleReviewSubmit(listingId, sellerId, review)}
      />
    </div>
  );
};

export default ConfirmationPage;
