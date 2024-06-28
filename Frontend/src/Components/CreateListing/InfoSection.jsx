import React from 'react';


const InfoSection = ({ category, setCategory, brand, setBrand, condition, setCondition }) => {
  return (
    <div className="infoSection">
      <h3>Info</h3>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled>Select a category</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="accessories">Furniture</option>
            <option value="accessories">Beauty</option>
            <option value="accessories">Appliances</option>
        </select>
      </label>
      <label>
        Brand
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="" disabled>Select a brand</option>
          <option value="nike">Nike</option>
          <option value="adidas">Adidas</option>
        </select>
      </label>
      <label>
        Condition
        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="" disabled>Select a condition</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>
      </label>
    </div>
  );
};

export default InfoSection;
