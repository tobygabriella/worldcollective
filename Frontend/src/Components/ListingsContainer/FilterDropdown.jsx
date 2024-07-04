import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getConditionName,
  getCategoryName,
  getSubcategoryName,
} from "../utils/ListingInfoUtil.js";
import "./FilterDropdown.css";

const FilterDropdown = ({ title, options, onSelect, selected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set(title.toLowerCase(), option);
    const newUrl = `${location.pathname}?${searchParams.toString()}`;
    navigate(newUrl);
  };

  const getDisplayName = (option) => {
    if (title.toLowerCase() === "condition") return getConditionName(option);
    if (title.toLowerCase() === "category") return getCategoryName(option);
    if (title.toLowerCase() === "subcategory")
      return getSubcategoryName(option);
    return option;
  };

  return (
    <div className="filterDropdown">
      <button onClick={() => setIsOpen(!isOpen)} className="filterButton">
        {title} {isOpen ? "▲" : "▼"}
      </button>
      {isOpen && (
        <div className="dropdownMenu">
          {options.map((option, index) => {
            const uniqueId = `${title}-${option}-${index}`;
            return (
              <div key={uniqueId} className="dropdownItem">
                <input
                  type="checkbox"
                  id={uniqueId}
                  name={uniqueId}
                  checked={selected === option}
                  onChange={() => handleSelect(option)}
                />
                <label htmlFor={uniqueId}>{getDisplayName(option)}</label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
