import React, { useState } from "react";
import "./CreateReviewModal.css";

const CreateReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleRatingClick = (index) => {
    setRating(index + 1);
  };

  const handleSubmit = () => {
    onSubmit({ rating, content }, setSuccessMessage, setErrorMessage);
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2>Leave a Review</h2>
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
        <button onClick={handleSubmit}>Submit</button>
        {successMessage && <p className="successMessage">{successMessage}</p>}
        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateReviewModal;
