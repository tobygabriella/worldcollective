import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import "./ListingDetails.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const ListingDetails = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`${API_KEY}/listings/${id}`);
        const data = await response.json();
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
      }
    };

    fetchListing();
  }, [id]);

  return <div className="listingDetailsContainer"></div>;
};

export default ListingDetails;
