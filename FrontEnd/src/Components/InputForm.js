import React from 'react';
import '../Styles/InputForm.css'; // Update the import path

const InputForm = ({ location, setLocation, handleSetLocation }) => {
  return (
    <div className="input-form">
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter location"
        className="input-field"
      />
      <button onClick={handleSetLocation} className="set-location-button">Set Location</button>
    </div>
  );
};

export default InputForm;
