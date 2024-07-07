import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import AppHeader from "../Headers/AppHeader";
import "./PaymentPage.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const PaymentPage = () => {
  const { id } = useParams();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [listing, setListing] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`${API_KEY}/listings/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setListing(data);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    if (listing) {
      const createPaymentIntent = async () => {
        try {
          const paymentResponse = await fetch(
            `${API_KEY}/create-payment-intent`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ amount: listing.price }),
            }
          );

          if (!paymentResponse.ok) {
            throw new Error("Network response for payment intent was not ok");
          }

          const paymentData = await paymentResponse.json();
          setClientSecret(paymentData.clientSecret);
        } catch (error) {
          console.error("Error creating payment intent:", error);
        }
      };

      createPaymentIntent();
    }
  }, [listing]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (error) {
      console.log("[error]", error);
      if (error.type === "card_error" || error.type === "validation_error") {
        alert(error.message);
      } else {
        alert("An unexpected error occurred.");
      }
    } else {
      console.log("[PaymentIntent]", paymentIntent);

      if (paymentIntent.status === 'succeeded') {
        try {
          const response = await fetch(
            `${API_KEY}/listings/${id}/complete-purchase`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
            }
          );

          if (response.ok) {
            setSuccess(true);
            navigate("/confirmation");
          } else {
            console.error("Failed to update transaction status on the server");
          }
        } catch (error) {
          console.error(
            "Error updating transaction status on the server:",
            error
          );
        }
      }
      else {
        alert("Payment was not successful. Please try another payment method.");
      }
    }
  };

  return (
    <div className="paymentPageContainer">
      <AppHeader />
      <div className="paymentContent">
        {isLoading ? (
          <p>Loading...</p>
        ) : listing ? (
          <>
            <h2>Complete your purchase for {listing.title}</h2>
            <form onSubmit={handleSubmit}>
              <CardElement />
              <button type="submit" disabled={!stripe}>
                Pay ${listing.price}
              </button>
            </form>
            {success && <p>Payment successful! Redirecting...</p>}
          </>
        ) : (
          <p>Listing not found.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
