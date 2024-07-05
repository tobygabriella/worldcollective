import React, { useState } from "react";
import "./CreateListing.css";
import AppHeader from "../Headers/AppHeader";
import PhotoSection from "./PhotoSection";
import DescriptionSection from "./DescriptionSection";
import InfoSection from "./InfoSection";
import { useNavigate } from "react-router-dom";


const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const CreateListing = () => {
  const [formInput, setFormInput] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    condition: "",
    price: "",
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...files]);
  };

  const handlePhotoDelete = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(formInput).forEach((key) => {
      formData.append(key, formInput[key]);
    });

    photos.forEach((photo) => {
      formData.append("images", photo);
    });

    try {
      const response = await fetch(`${API_KEY}/listings`, {
        method: "POST",
        credentials: "include",
        body: formData,
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const createdListing = await response.json();
        setSuccess("Listing created successfully!");
        setError("");
        navigate(`/listings/${createdListing.id}`);
      } else {
        const errMessage = await response.json();
        console.error("Error response:", errMessage);
        setError(errMessage.error);
        setSuccess("");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="createListingContainer">
      <AppHeader />
      <div className="body">
        <h2>List an item</h2>
        <form onSubmit={handleSubmit}>
          <PhotoSection
            photos={photos}
            handlePhotoUpload={handlePhotoUpload}
            handlePhotoDelete={handlePhotoDelete}
          />
          <DescriptionSection
            formInput={formInput}
            setFormInput={setFormInput}
          />
          <InfoSection formInput={formInput} setFormInput={setFormInput} />
          <button type="submit" className="submitButton">
            Create Listing
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
};

export default CreateListing;
