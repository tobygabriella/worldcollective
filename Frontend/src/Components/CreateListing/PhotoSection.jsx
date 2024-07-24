import React from "react";

const PhotoSection = ({ photos, handlePhotoUpload, handlePhotoDelete }) => {
  return (
    <div className="photosSection">
      <h3>Photos</h3>
      <p>Add up to 8 photos in JPEG or PNG format</p>
      <div className="photosGrid">
        {Array(8)
          .fill()
          .map((_, index) => (
            <div key={index} className="photoSlot">
              {photos[index] ? (
                <div className="uploadedPhotoContainer">
                  <img
                    src={URL.createObjectURL(photos[index])}
                    alt="Uploaded"
                    className="uploadedPhoto"
                  />
                  <button
                    className="deletePhotoButton"
                    onClick={() => handlePhotoDelete(index)}
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <label className="addPhotoLabel">
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={handlePhotoUpload}
                    className="photoInput"
                    required={photos.length === 0}
                  />
                  <div className="photoPlaceholder">
                    <i className="fas fa-camera"></i>
                    <span>Add a photo</span>
                  </div>
                </label>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default PhotoSection;
