import React, { useState } from "react";
import "./CreateReviewModal.css";
import renderStars from "../utils/renderStars";

const CreateReviewModal = ({
  onClose,
  onSubmit,
  successMessage,
  errorMessage,
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  const handleRatingClick = (index) => {
    setRating(index + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating, content });
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2>Leave a Review</h2>
        {errorMessage ? (
          <p className="errorMessage">{errorMessage}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rating">
              {renderStars(rating, handleRatingClick)}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your review here"
            />
            <button type="submit">Submit</button>
          </form>
        )}
        {successMessage && <p className="successMessage">{successMessage}</p>}
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateReviewModal;
