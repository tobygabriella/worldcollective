import React, { useEffect, useState } from "react";
import ListingItem from "../ListingItem/ListingItem";
import ListingsContainer from "../ListingsContainer/ListingsContainer";
import useLoading from "../CustomHooks/useLoading.jsx";
import { fetchListingsWithLiked } from "../utils/likeStatusUtil.js";
import Loading from "../Loading/Loading.jsx";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      startLoading();
      try {
        const response = await fetch(`${API_KEY}/cart`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const itemsWithStatusAndLiked = await fetchListingsWithLiked(
            data.items.map((item) => ({
              ...item.listing,
              cartItemId: item.id,
            }))
          );
          setCartItems(itemsWithStatusAndLiked);
        } else {
          console.error("Failed to fetch cart items");
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        stopLoading();
      }
    };
    fetchCartItems();
  }, []);

  const handleRemoveItem = async (cartItemId) => {
    try {
      const response = await fetch(`${API_KEY}/cart/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setCartItems(
          cartItems.filter((item) => item.cartItemId !== cartItemId)
        );
      } else {
        console.error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${API_KEY}/create-payment-intent/cart`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        navigate("/checkout", {
          state: { clientSecret: data.clientSecret, cartItems },
        });
      } else {
        console.error("Failed to create payment intent");
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <ListingsContainer
        title="Shopping Cart"
        listings={cartItems}
        showFilters={false}
      >
        {(cartItem) => (
          <ListingItem
            key={cartItem.id}
            {...cartItem}
            cartItemId={cartItem.cartItemId}
            handleRemoveItem={() => handleRemoveItem(cartItem.cartItemId)}
          />
        )}
      </ListingsContainer>
      {cartItems.length > 0 && (
        <button className="checkoutButton" onClick={handleCheckout}>
          Checkout
        </button>
      )}
    </div>
  );
};

export default ShoppingCart;
