import React from 'react';
import '../Styles/Prediction.css'; // Update the import path

const Prediction = ({ handlePredictWeather, prediction, type }) => {
  return (
    <div className="prediction">
      <button onClick={handlePredictWeather} className="predict-button">{type} Weather Prediction</button>
      {prediction !== null && (
        <div className="prediction-result">
          <h2>Predicted Temperature for the Next Hour {type} method </h2>
          <p>{prediction}°C</p>
        </div>
      )}
    </div>
  );
};

export default Prediction;
