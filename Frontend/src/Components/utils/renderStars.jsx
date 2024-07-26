import React from "react";

const renderStars = (rating, handleRatingClick) => {
  return [...Array(5)].map((_, index) => (
    <span
      key={index}
      className={`star ${index < rating ? "filled" : ""}`}
      onClick={handleRatingClick ? () => handleRatingClick(index) : undefined}
      style={handleRatingClick ? { cursor: "pointer" } : {}}
    >
      &#9733;
    </span>
  ));
};

export default renderStars;
