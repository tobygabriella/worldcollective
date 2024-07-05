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
  const subcategories = getSubcategory(category);

  return (
    <div className="infoSection">
      <h3>Info</h3>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
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
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
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
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
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
