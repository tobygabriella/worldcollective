import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import AppHeader from "../Headers/AppHeader";
import Loading from "../Loading/Loading.jsx";
import useLoading from "../CustomHooks/useLoading.jsx";
import "./PaymentPage.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const PaymentPage = () => {
  const { listing } = useOutletContext();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const { isLoading } = useLoading();
  const [success, setSuccess] = useState(false);

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
      if (error.type === "card_error" || error.type === "validation_error") {
        alert(error.message);
      } else {
        alert("An unexpected error occurred.");
      }
    } else {
      if (paymentIntent.status === "succeeded") {
        try {
          const response = await fetch(
            `${API_KEY}/listings/${listing.id}/complete-purchase`,
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
            navigate("/confirmation", {
              state: { listingId: listing.id, sellerId: listing.sellerId },
            });
          } else {
            console.error("Failed to update transaction status on the server");
          }
        } catch (error) {
          console.error(
            "Error updating transaction status on the server:",
            error
          );
        }
      } else {
        alert("Payment was not successful. Please try another payment method.");
      }
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="paymentPageContainer">
      <AppHeader />
      <div className="paymentContent">
        {listing ? (
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
