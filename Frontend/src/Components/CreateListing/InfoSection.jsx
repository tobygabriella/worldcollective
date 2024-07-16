import React from "react";
import { Category } from "../Enums/Category.js";
import { Condition } from "../Enums/Condition.js";
import { Brand } from "../Enums/Brand.js";
import {
  getConditionName,
  getCategoryName,
  getSubcategoryName,
  getSubcategory,
} from "../utils/ListingInfoUtil.js";

const InfoSection = ({ formInput, setFormInput }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const subcategories = getSubcategory(formInput.category);

  return (
    <div className="infoSection">
      <h3>Info</h3>
      <label>
        Category
        <select
          name="category"
          value={formInput.category}
          onChange={handleChange}
        >
          <option value="" disabled>
            Select a category
          </option>
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>
              {getCategoryName(cat)}
            </option>
          ))}
        </select>
      </label>

      {formInput.category && (
        <label>
          Subcategory
          <select
            name="subcategory"
            value={formInput.subcategory}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select a subcategory
            </option>
            {subcategories.map((subcat) => (
              <option key={subcat} value={subcat}>
                {getSubcategoryName(subcat)}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        Brand
        <select name="brand" value={formInput.brand} onChange={handleChange}>
          <option value="" disabled>
            Select a brand
          </option>
          {Brand.map((br) => (
            <option key={br} value={br}>
              {br}
            </option>
          ))}
        </select>
      </label>

      <label>
        Condition
        <select
          name="condition"
          value={formInput.condition}
          onChange={handleChange}
        >
          <option value="" disabled>
            Select a condition
          </option>
          {Object.values(Condition).map((cond) => (
            <option key={cond} value={cond}>
              {getConditionName(cond)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {formInput.auction ? "Initial Bid Price" : "Price"}
        <input
          name={formInput.auction ? "initialBid" : "price"}
          type="number"
          value={formInput.auction ? formInput.initialBid : formInput.price}
          onChange={handleChange}
          required
        />
      </label>
    </div>
  );
};

export default InfoSection;
