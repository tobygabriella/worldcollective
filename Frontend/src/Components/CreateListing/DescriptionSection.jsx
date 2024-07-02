import React from "react";

const DescriptionSection = ({
  title,
  setTitle,
  description,
  setDescription,
}) => {
  return (
    <div className="descriptionSection">
      <h3>Description</h3>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <textarea
        placeholder="e.g. small grey Nike t-shirt, only worn a few times"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength="1000"
      ></textarea>
      <div className="hashtagInfo">
        <span>Max:1000</span>
      </div>
    </div>
  );
};

export default DescriptionSection;
