import React, { useState } from 'react';
import './App.css';
import FirstScreen from './FirstScreen';
import CanvasScreen from './CanvasScreen';

const App = () => {
  const [step, setStep] = useState('resize'); // 'resize' or 'canvas'
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [finalBackground, setFinalBackground] = useState('white');

  return (
    <div className="app-container">
      {step === 'resize' && (
        <FirstScreen
          dimensions={dimensions}
          setDimensions={setDimensions}
          setFinalBackground={setFinalBackground}
          onAccept={() => setStep('canvas')}
        />
      )}

      {step === 'canvas' && (
        <CanvasScreen
          dimensions={dimensions}
          finalBackground={finalBackground}
        />
      )}
    </div>
  );
};

export default App;
