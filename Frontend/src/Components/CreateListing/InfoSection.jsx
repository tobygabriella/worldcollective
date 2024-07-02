import React from "react";
import { Categories, Subcategories, Conditions, Brands } from "../Enums/Enums.js";
import {
  getConditionName,
  getCategoryName,
  getSubcategoryName,
} from "../utils/ListingInfoUtil.js";

const InfoSection = ({
  category,
  setCategory,
  brand,
  setBrand,
  condition,
  setCondition,
  price,
  setPrice,
  subcategory,
  setSubcategory,
}) => {
  return (
    <div className="infoSection">
      <h3>Info</h3>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="" disabled>
            Select a category
          </option>
          {Object.values(Categories).map((cat) => (
            <option key={cat} value={cat}>
              {getCategoryName(cat)}
            </option>
          ))}
        </select>
      </label>

      {category && (
        <label>
          Subcategory
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          >
            <option value="" disabled>
              Select a subcategory
            </option>
            {Subcategories[category.toUpperCase()].map((subcat) => (
              <option key={subcat} value={subcat}>
                {getSubcategoryName(subcat)}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        Brand
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="" disabled>
            Select a brand
          </option>
          {Brands.map((br) => (
            <option key={br} value={br}>
              {br}
            </option>
          ))}
        </select>
      </label>

      <label>
        Condition
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="" disabled>
            Select a condition
          </option>
          {Object.values(Conditions).map((cond) => (
            <option key={cond} value={cond}>
              {getConditionName(cond)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Price
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </label>
    </div>
  );
};

export default InfoSection;
