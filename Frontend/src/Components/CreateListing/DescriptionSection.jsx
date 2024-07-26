import React from "react";

const DescriptionSection = ({ formInput, setFormInput }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="descriptionSection">
      <h3>Description</h3>
      <label>
        Title
        <input
          type="text"
          name="title"
          value={formInput.title}
          onChange={handleChange}
          required
        />
      </label>
      <textarea
        placeholder="e.g. small grey Nike t-shirt, only worn a few times"
        name="description"
        value={formInput.description}
        onChange={handleChange}
        maxLength="1000"
        required
      ></textarea>
      <div className="hashtagInfo">
        <span>Max:1000</span>
      </div>
    </div>
  );
};

export default DescriptionSection;
