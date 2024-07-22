import React, { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import useLoading from "../CustomHooks/useLoading.jsx";
import Loading from "../Loading/Loading.jsx";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const ListingDetailContainer = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchListing = async () => {
      startLoading();
      try {
        const response = await fetch(`${API_KEY}/listings/${id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        stopLoading();
      }
    };

    fetchListing();
  }, [id]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <Outlet context={{ listing }} />
    </div>
  );
};

export default ListingDetailContainer;
