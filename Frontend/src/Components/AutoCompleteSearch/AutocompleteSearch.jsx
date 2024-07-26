import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AutoCompleteSearch.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const AutocompleteSearch = ({ searchQuery, setSearchQuery }) => {
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length > 0) {
      const fetchSuggestions = async () => {
        try {
          const response = await fetch(
            `${API_KEY}/search/suggestions?query=${searchQuery}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data);
          } else {
            console.error("Error fetching suggestions");
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSelectSuggestion = (suggestion) => {
    navigate(`/search?query=${suggestion}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  return (
    <div className="autocompleteSearch">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for items"
        className="searchInput"
        onKeyDown={handleKeyDown}
      />
      {suggestions.length > 0 && (
        <ul className="suggestionsList">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => handleSelectSuggestion(suggestion.title)}
              className="suggestionItem"
            >
              {suggestion.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteSearch;
