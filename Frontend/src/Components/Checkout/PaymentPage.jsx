import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import AppHeader from "../Headers/AppHeader";
import Loading from "../Loading/Loading.jsx";
import useLoading from "../CustomHooks/useLoading.jsx";
import "./PaymentPage.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const PaymentPage = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const { clientSecret, listing, cartItems } = location.state;
  const { isLoading } = useLoading();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!clientSecret || (!listing && !cartItems)) {
      navigate("/");
    }
  }, [clientSecret, listing, cartItems, navigate]);

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
          if (listing) {
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
                isSingleCheckout: true,
              });
            } else {
              console.error(
                "Failed to update transaction status on the server"
              );
            }
          } else if (cartItems) {
            const response = await fetch(`${API_KEY}/cart/complete-purchase`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                paymentIntentId: paymentIntent.id,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              setSuccess(true);
              navigate("/confirmation", {
                state: { listings: data.listings, isSingleCheckout: false },
              });
            } else {
              console.error(
                "Failed to update transaction status on the server"
              );
            }
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
          </>
        ) : (
          <>
            <h2>Complete your purchase</h2>
            <ul>
              {cartItems.map((item) => (
                <li key={item.id}>
                  {item.title} - ${item.price}
                </li>
              ))}
            </ul>
            <form onSubmit={handleSubmit}>
              <CardElement />
              <button type="submit" disabled={!stripe}>
                Pay
              </button>
            </form>
          </>
        )}
        {success && <p>Payment successful! Redirecting...</p>}
      </div>
    </div>
  );
};

export default PaymentPage;
