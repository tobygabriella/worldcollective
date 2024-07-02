import React, { useState } from "react";
import "./CreateListing.css";
import AppHeader from "../Headers/AppHeader";
import PhotoSection from "./PhotoSection";
import DescriptionSection from "./DescriptionSection";
import InfoSection from "./InfoSection";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const CreateListing = () => {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [success, setSuccess] = useState("");

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
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("subcategory", subcategory);
    formData.append("condition", condition);
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
        setSuccess("Listing created successfully!");
        setError("");
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
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
          />
          <InfoSection
            category={category}
            setCategory={setCategory}
            subcategory={subcategory}
            setSubcategory={setSubcategory}
            brand={brand}
            setBrand={setBrand}
            condition={condition}
            setCondition={setCondition}
            price={price}
            setPrice={setPrice}
          />
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
