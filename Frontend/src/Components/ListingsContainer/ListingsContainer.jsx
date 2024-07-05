import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppHeader from "../Headers/AppHeader";
import FilterDropdown from "./FilterDropdown.jsx";
import { Category } from "../Enums/Category.js";
import { Condition } from "../Enums/Condition.js";
import { Brand } from "../Enums/Brand.js";
import { getSubcategory } from "../utils/ListingInfoUtil.js";
import "./ListingsContainer.css";

const ListingsContainer = ({
  title,
  listings,
  children,
  showFilters = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFilters, setSelectedFilters] = useState({});

  // Initialize filters from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filters = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });
    setSelectedFilters(filters);
  }, [location.search]);

  // Handle filter selection and update URL
  const handleSelectFilter = (filterType, option) => {
    const updatedFilters = {
      ...selectedFilters,
      [filterType]: option,
    };
    setSelectedFilters(updatedFilters);
    const queryParams = new URLSearchParams(updatedFilters).toString();
    const newUrl = `${location.pathname}?${queryParams}`;

    navigate(newUrl);
  };

  return (
    <div className="listingsContainer">
      <AppHeader />
      <div className="listingsContent">
        <h2>{title}</h2>
        <div className="filters">
          {showFilters && (
            <div className="filters">
              <FilterDropdown
                title="Category"
                options={Object.values(Category)}
                onSelect={(option) => handleSelectFilter("category", option)}
                selected={selectedFilters["category"]}
              />
              <FilterDropdown
                title="Subcategory"
                options={getSubcategory(selectedFilters["category"])}
                onSelect={(option) => handleSelectFilter("subcategory", option)}
                selected={selectedFilters["subcategory"]}
              />
              <FilterDropdown
                title="Brand"
                options={Brand}
                onSelect={(option) => handleSelectFilter("brand", option)}
                selected={selectedFilters["brand"]}
              />
              <FilterDropdown
                title="Condition"
                options={Object.values(Condition)}
                onSelect={(option) => handleSelectFilter("condition", option)}
                selected={selectedFilters["condition"]}
              />
            </div>
          )}
        </div>
        <div className="listingsGrid">
          {listings.map((listing) => (
            <div className="listingItemWrapper" key={listing.id}>
              {children(listing)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListingsContainer;
