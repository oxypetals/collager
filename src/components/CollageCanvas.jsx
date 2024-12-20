import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const CollageCanvas = () => {
  const [elements, setElements] = useState([]); // This will hold the collage elements (images, text, etc.)

  // Function to handle export of the collage
  const exportCollage = () => {
    const collage = document.getElementById("collage-canvas");
    html2canvas(collage).then((canvas) => {
      const link = document.createElement("a");
      link.download = "collage.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  // Function to add an element to the collage (e.g., sticker, image, etc.)
  const addElement = (newElement) => {
    setElements([...elements, newElement]);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Export button */}
      <button
        onClick={exportCollage}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Export
      </button>

      {/* Collage canvas container */}
      <div
        id="collage-canvas"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          border: '2px solid #ccc',
          backgroundColor: '#f8f8f8',
        }}
      >
        {/* Map through elements and render them */}
        {elements.map((element, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.width}px`,
              height: `${element.height}px`,
            }}
          >
            <img
              src={element.src}
              alt={`collage-element-${index}`}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollageCanvas;
