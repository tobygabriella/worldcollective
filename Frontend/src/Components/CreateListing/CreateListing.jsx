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
    formData.append("title", formInput.title);
    formData.append("description", formInput.description);
    formData.append("price", formInput.price);
    formData.append("category", formInput.category);
    formData.append("subcategory", formInput.subcategory);
    formData.append("condition", formInput.condition);
    formData.append("brand", formInput.brand);
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
            title={formInput.title}
            setTitle={(value) => setFormInput({ ...formInput, title: value })}
            description={formInput.description}
            setDescription={(value) =>
              setFormInput({ ...formInput, description: value })
            }
          />
          <InfoSection
            category={formInput.category}
            setCategory={(value) =>
              setFormInput({ ...formInput, category: value })
            }
            subcategory={formInput.subcategory}
            setSubcategory={(value) =>
              setFormInput({ ...formInput, subcategory: value })
            }
            brand={formInput.brand}
            setBrand={(value) => setFormInput({ ...formInput, brand: value })}
            condition={formInput.condition}
            setCondition={(value) =>
              setFormInput({ ...formInput, condition: value })
            }
            price={formInput.price}
            setPrice={(value) => setFormInput({ ...formInput, price: value })}
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
