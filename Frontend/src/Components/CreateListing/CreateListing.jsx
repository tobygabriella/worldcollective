import React, { useState } from 'react';
import './CreateListing.css';
import AppHeader from '../Headers/AppHeader';
import PhotoSection from './PhotoSection';
import DescriptionSection from './DescriptionSection';
import InfoSection from './InfoSection';

const CreateListing = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [photos, setPhotos] = useState([]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...files]);
  };

  const handlePhotoDelete = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  return (
    <div className="createListingContainer">
      <AppHeader />
      <div className="body">
        <h2>List an item</h2>
        <PhotoSection
          photos={photos}
          handlePhotoUpload={handlePhotoUpload}
          handlePhotoDelete={handlePhotoDelete}
        />
        <DescriptionSection
          description={description}
          setDescription={setDescription}
        />
        <InfoSection
          category={category}
          setCategory={setCategory}
          brand={brand}
          setBrand={setBrand}
          condition={condition}
          setCondition={setCondition}
        />
      </div>
    </div>
  );
};

export default CreateListing;
