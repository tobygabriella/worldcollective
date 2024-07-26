import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./PlaceBidModal.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const PlaceBidModal = ({ onClose, listingId, initialPrice, isSeller }) => {
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState("");
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [cardRequired, setCardRequired] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

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

    // Check if card details are required
    if (!clientSecret && !cardRequired) {
      setCardRequired(true);
      createSetupIntent();
      return;
    }

    // Handle the card details submission if required
    if (cardRequired) {
      handleCardDetailsSubmit(bidAmount);
    } else {
      submitBid(bidAmount, null);
    }
  };

  const createSetupIntent = async () => {
    try {
      const response = await fetch(`${API_KEY}/create-setup-intent`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } else {
        console.error("Failed to create setup intent");
      }
    } catch (error) {
      console.error("Error creating setup intent:", error);
    }
  };

  const handleCardDetailsSubmit = async (bidAmount) => {
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      if (setupIntent.status === "succeeded") {
        submitBid(bidAmount, setupIntent.payment_method);
      } else {
        setError(
          "Setup was not successful. Please try another payment method."
        );
      }
    }
  };

  const submitBid = async (bidAmount, paymentMethodId) => {
    try {
      const response = await fetch(`${API_KEY}/listings/${listingId}/bids`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount: bidAmount, paymentMethodId }),
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
            {cardRequired && (
              <div>
                <CardElement />
              </div>
            )}
            <button onClick={handleBidSubmit}>Submit Bid</button>
            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default PlaceBidModal;
