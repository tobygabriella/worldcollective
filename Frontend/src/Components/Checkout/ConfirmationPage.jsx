import React from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../Headers/AppHeader";
import "./ConfirmationPage.css";

const ConfirmationPage = () => {
  const navigate = useNavigate();

  const handleBackToListings = () => {
    navigate("/userProfile");
  };

  return (
    <div className="confirmationPageContainer">
      <AppHeader />
      <div className="confirmationContent">
        <h2>Thank you for your purchase!</h2>
        <p>Your transaction was successful.</p>
        <button onClick={handleBackToListings}>Back to your profile</button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
