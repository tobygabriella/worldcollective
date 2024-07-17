import React, { useState } from "react";
import "./CreateReviewModal.css";

const CreateReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  successMessage,
  errorMessage,
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");

  if (!isOpen) return null;

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
              {[...Array(5)].map((star, index) => (
                <span
                  key={index}
                  className={`star ${index < rating ? "filled" : ""}`}
                  onClick={() => handleRatingClick(index)}
                >
                  ★
                </span>
              ))}
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
