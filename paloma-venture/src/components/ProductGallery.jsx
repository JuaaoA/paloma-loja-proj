import React, { useState } from 'react';

const ProductGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [zoomStyle, setZoomStyle] = useState({});

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = (e.clientX - left) / width * 100;
    const y = (e.clientY - top) / height * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2)' });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  return (
    <div className="image-gallery">
      <div className="thumbnails">
        {images.map((img, idx) => (
          <img 
            key={idx} 
            src={img} 
            className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
            onClick={() => setSelectedImage(img)}
            alt="thumb" 
          />
        ))}
      </div>
      <div className="main-image-container" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <img src={selectedImage} alt="Produto" style={zoomStyle} />
      </div>
    </div>
  );
};

export default ProductGallery;