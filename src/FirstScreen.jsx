import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

// Helper to convert hex to rgb
function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

const FirstScreen = ({ dimensions, setDimensions, setFinalBackground, onAccept }) => {
  const [baseColor, setBaseColor] = useState('#ffffff');
  const [transparency, setTransparency] = useState(100);

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setDimensions((prev) => ({
      ...prev,
      [name]: Math.max(100, Math.min(value, 3000)), // limit range
    }));
  };

  const onResizeStop = (e, direction, ref, delta, position) => {
    const newWidth = parseInt(ref.style.width, 10);
    const newHeight = parseInt(ref.style.height, 10);
    setDimensions({ width: newWidth, height: newHeight });
  };

  const handleAccept = () => {
    const alpha = transparency / 100;
    const background = `rgba(${hexToRgb(baseColor)}, ${alpha})`;
    setFinalBackground(background);
    onAccept();
  };

  const alpha = transparency / 100;
  const previewBackground = `rgba(${hexToRgb(baseColor)}, ${alpha})`;

  return (
    <div className="resize-stage">
      <h1>Set Your Canvas</h1>
      <p>Adjust size and background, then click Accept.</p>

      <div className="controls">
        <label>
          Width:
          <input
            type="number"
            name="width"
            value={dimensions.width}
            onChange={handleDimensionChange}
          />
        </label>
        <label>
          Height:
          <input
            type="number"
            name="height"
            value={dimensions.height}
            onChange={handleDimensionChange}
          />
        </label>
      </div>

      <div className="background-controls">
        <h2>Background</h2>
        <label>
          Base Color:
          <input
            type="color"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
          />
        </label>
        <label>
          Transparency: {transparency}%
          <input
            type="range"
            min="0"
            max="100"
            value={transparency}
            onChange={(e) => setTransparency(e.target.value)}
          />
        </label>
      </div>

     <div className="resizable-box-container">
  <Rnd
    disableDragging={true} // Disable moving the box
    size={{ width: dimensions.width, height: dimensions.height }}
    onResizeStop={onResizeStop}
    enableResizing={{ bottomRight: true, bottom: true, right: true }}
    style={{
      border: '1px solid black',
      background: previewBackground
    }}
  />
</div>


      <button className="accept-button" onClick={handleAccept}>Accept</button>
    </div>
  );
};

export default FirstScreen;
