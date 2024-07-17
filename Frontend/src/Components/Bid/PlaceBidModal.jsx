import React, { useState, useEffect } from "react";
import "./PlaceBidModal.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const PlaceBidModal = ({ onClose, listingId, initialPrice, isSeller }) => {
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPreviousBids();
  }, []);

  const fetchPreviousBids = async () => {
    try {
      const response = await fetch(`${API_KEY}/listings/${listingId}/bids`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setBids(data);
      } else {
        console.error("Failed to fetch bids");
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
    }
  };

  const handleBidSubmit = async () => {
    const bidAmount = parseInt(newBid);
    const currentHighestBid = Math.max(
      initialPrice,
      ...bids.map((bid) => bid.amount)
    );

    if (isNaN(bidAmount) || bidAmount <= 0) {
      setError("Please enter a valid integer bid amount.");
      return;
    }

    if (bidAmount <= currentHighestBid) {
      setError("Your bid must be higher than the current highest bid.");
      return;
    }

    try {
      const response = await fetch(`${API_KEY}/listings/${listingId}/bids`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount: newBid }),
      });

      if (response.ok) {
        fetchPreviousBids();
        setNewBid("");
        setError("");
        onClose();
      } else {
        console.error("Failed to place bid");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <button className="closeButton" onClick={onClose}>
          &times;
        </button>
        <h2>{isSeller ? "View All Bids" : "Place a Bid"}</h2>
        <p>Initial Price: ${initialPrice}</p>
        {bids.length > 0 && (
          <p>
            Current Highest Bid: ${Math.max(...bids.map((bid) => bid.amount))}
          </p>
        )}
        <div className="previousBids">
          {bids.map((bid, index) => (
            <p key={index}>
              @{bid.user.username} placed a bid of ${bid.amount}
            </p>
          ))}
        </div>
        {!isSeller && (
          <>
            <input
              type="number"
              value={newBid}
              onChange={(e) => setNewBid(e.target.value)}
              placeholder="Enter your bid"
            />
            <button onClick={handleBidSubmit}>Submit Bid</button>
            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default PlaceBidModal;
