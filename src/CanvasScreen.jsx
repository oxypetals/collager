import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric'; // Correctly import fabric

const CanvasScreen = ({ dimensions, finalBackground }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);   // Left drawer for stickers
  const [layersOpen, setLayersOpen] = useState(false);   // Right drawer for layers
  const [fontsOpen, setFontsOpen] = useState(false);     // Bottom-left drawer for fonts
  const [, forceRender] = useState(); // force rerender

  const [textValue, setTextValue] = useState("");
  const [availableFonts, setAvailableFonts] = useState([]); // store {name, dataURL} pairs
  const [selectedFont, setSelectedFont] = useState(null); // currently selected font from the drawer

  // Import stickers
  const stickerImages = import.meta.glob('./stickers/*.png', { eager: true });
  const stickerPaths = Object.keys(stickerImages);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: finalBackground,
    });
    setCanvas(fabricCanvas);
    fabricCanvas.renderAll();

    return () => fabricCanvas.dispose();
  }, [dimensions, finalBackground]);

  useEffect(() => {
    if (!canvas) return;

    const handleKeyDown = (e) => {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      // Delete key to remove the active object
      if (e.key === 'Delete') {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.renderAll();
        forceUpdateLayers();
      }

      // 'd' key to duplicate the object
      if (e.key === 'd') {
        if (activeObject.type === 'image') {
          activeObject.clone((cloned) => {
            cloned.set({
              left: (cloned.left || 0) + 10,
              top: (cloned.top || 0) + 10,
            });
            // Retain _originalSrc for thumbnail
            cloned._originalSrc = activeObject._originalSrc;
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            forceUpdateLayers();
          });
        } else {
          console.warn('Active object is not an image and cannot be cloned easily.');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas]);

  const forceUpdateLayers = () => forceRender(Date.now());

  const addImageToCanvas = (src) => {
    const imgElement = new Image();
    imgElement.src = src;

    imgElement.onload = () => {
      const fabricImage = new fabric.Image(imgElement, {
        left: Math.random() * (dimensions.width - 100),
        top: Math.random() * (dimensions.height - 100),
        hasControls: true,
        hasBorders: true,
      });
      fabricImage._originalSrc = src; // Store src for layer thumbnail

      canvas.add(fabricImage);
      canvas.renderAll();
      forceUpdateLayers();
    };

    imgElement.onerror = () => {
      console.error('Failed to load image:', src);
    };
  };

  const getLayerObjects = () => {
    if (!canvas) return [];
    // getObjects returns in bottom-to-top order
    return canvas.getObjects();
  };

  const moveObjectForward = (obj) => {
    const objects = canvas.getObjects().slice(); // clone to avoid side effects
    const idx = objects.indexOf(obj);
    if (idx < objects.length - 1) {
      // Move the object one step forward in the array
      objects.splice(idx, 1);
      objects.splice(idx + 1, 0, obj);

      canvas.clear();
      objects.forEach((o) => canvas.add(o));
      canvas.renderAll();
      forceUpdateLayers();
    }
  };

  const moveObjectBackward = (obj) => {
    const objects = canvas.getObjects().slice();
    const idx = objects.indexOf(obj);
    if (idx > 0) {
      // Move the object one step backward
      objects.splice(idx, 1);
      objects.splice(idx - 1, 0, obj);

      canvas.clear();
      objects.forEach((o) => canvas.add(o));
      canvas.renderAll();
      forceUpdateLayers();
    }
  };

  const handleExport = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png' });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas_export.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

   const handleAddText = () => {
    if (!canvas || !textValue.trim()) return;
    const fontName = selectedFont ? selectedFont.name : 'Arial';

    // Use IText for editable text
    const iText = new fabric.IText(textValue, {
      left: 50,
      top: 50,
      fontSize: 30,
      fontFamily: fontName,
      hasControls: true,
      hasBorders: true,
    });
    canvas.add(iText);
    canvas.setActiveObject(iText);
    canvas.renderAll();
    forceUpdateLayers();
  };

  const handleFontUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fontName = 'CustomFont' + Date.now(); // unique font name
    const reader = new FileReader();
    reader.onload = (event) => {
      const fontData = event.target.result;

      // Create a @font-face rule dynamically
      const fontFaceRule = `
        @font-face {
          font-family: '${fontName}';
          src: url(${fontData}) format('opentype');
        }
      `;

      const styleEl = document.createElement('style');
      styleEl.appendChild(document.createTextNode(fontFaceRule));
      document.head.appendChild(styleEl);

      // Add to availableFonts array
      setAvailableFonts((prev) => [...prev, { name: fontName, dataURL: fontData }]);
    };
    reader.readAsDataURL(file);
  };

  const applyFontToSelectedText = (font) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set({ fontFamily: font.name });
      canvas.renderAll();
      forceUpdateLayers();
    }
  };
 // Transparent Background button
 const makeBackgroundTransparent = () => {
  if (!canvas) return;
  canvas.backgroundColor = ''; // or 'transparent'
  canvas.renderAll();
};


  return (
    <div className="canvas-stage">
      {/* Left drawer for stickers */}
      <div className={`drawer left ${drawerOpen ? 'open' : ''}`}>
        <h3>Stickers</h3>
        <div className="thumbnail-list">
          {stickerPaths.map((src, index) => (
            <div
              key={index}
              className="thumbnail-item"
              onClick={() => addImageToCanvas(src)}
            >
              <img
                src={src}
                alt={`sticker-${index}`}
                style={{ width: '100px', height: '100px' }}
              />
            </div>
          ))}
        </div>
      </div>
      <button className="drawer-toggle left" onClick={() => setDrawerOpen(!drawerOpen)}>
        {drawerOpen ? 'Close' : 'Open'} Stickers
      </button>

      {/* Right drawer for layers */}
      <div className={`drawer right ${layersOpen ? 'open' : ''}`}>
        <h3>Layers</h3>
        <div className="layer-list">
          {getLayerObjects().map((obj, i) => {
            let src = obj._originalSrc || '';
            return (
              <div key={i} className="layer-item">
                {obj.type === 'image' && (
                  <img
                    src={src}
                    alt={`layer-${i}`}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                )}
                {obj.type === 'i-text' && (
                  <div style={{
                    width: '50px', 
                    height: '50px', 
                    border: '1px solid #000', 
                    display:'flex', 
                    alignItems:'center', 
                    justifyContent:'center', 
                    fontSize:'10px', 
                    overflow:'hidden'
                  }}>
                    {obj.text}
                  </div>
                )}
                <div className="layer-controls">
                  <button onClick={() => moveObjectBackward(obj)}>↓</button>
                  <button onClick={() => moveObjectForward(obj)}>↑</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <button className="drawer-toggle right" onClick={() => setLayersOpen(!layersOpen)}>
        {layersOpen ? 'Close' : 'Open'} Layers
      </button>

      {/* Font drawer (bottom-left) */}
      <div className={`drawer bottom-left ${fontsOpen ? 'open' : ''}`}>
        <h3>Fonts</h3>
        <input type="file" accept=".otf" onChange={handleFontUpload} style={{marginBottom:'10px'}}/>
        <div className="font-list">
          {availableFonts.map((font, i) => (
            <div key={i} className="font-item" onClick={() => { setSelectedFont(font); applyFontToSelectedText(font); }}>
              {font.name}
            </div>
          ))}
        </div>
      </div>
      <button className="drawer-toggle bottom-left" onClick={() => setFontsOpen(!fontsOpen)}>
        {fontsOpen ? 'Close' : 'Open'} Fonts
      </button>

        {/* Export button */}
      <button className="export-button" onClick={handleExport}>Export</button>

      {/* Transparent background button */}
      <button className="transparent-button" onClick={makeBackgroundTransparent} style={{
        position:'absolute', top:'10px', right:'100px', border:'1px solid black', background:'white', padding:'5px', cursor:'pointer', zIndex:50
      }}>
        Transparent BG
      </button>

      {/* Text input controls */}
      <div className="text-controls" style={{position:'absolute', top:'50px', right:'10px', background:'#fff', border:'1px solid #000', padding:'10px', zIndex:100}}>
        <h4>Add Text</h4>
        <input 
          type="text" 
          value={textValue} 
          onChange={(e) => setTextValue(e.target.value)} 
          placeholder="Enter text" 
          style={{marginBottom:'10px', width:'100px'}}
        />
        <button onClick={handleAddText}>Add Text</button>
      </div>

      <div
        className="canvas-container"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          border: '1px solid black',
          position:'relative'
        }}
      >
        <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} />
      </div>
    </div>
  );
};

export default CanvasScreen;
