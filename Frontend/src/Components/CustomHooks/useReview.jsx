import { useState } from "react";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const useReview = () => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const handleReviewSubmit = async (listingId, sellerId, review) => {
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
        setErrorMessage("");
        closeReviewModal();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to submit review");
        setSuccessMessage("");
      }
    } catch (error) {
      setErrorMessage("Error submitting review");
      setSuccessMessage("");
    }
  };

  return {
    isReviewModalOpen,
    successMessage,
    errorMessage,
    openReviewModal,
    closeReviewModal,
    handleReviewSubmit,
  };
};

export default useReview;
