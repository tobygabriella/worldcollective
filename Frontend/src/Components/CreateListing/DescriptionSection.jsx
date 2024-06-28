import React from 'react';


const DescriptionSection = ({ description, setDescription }) => {
  return (
    <div className="descriptionSection">
      <h3>Description</h3>
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
