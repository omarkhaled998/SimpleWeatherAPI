import React from 'react';
import '../Styles/WeatherDetails.css'; // Update the import path

const WeatherDetails = ({ weatherData }) => {
  return (
    <div className="weather-details">
      <h2>Current Weather in {weatherData.location.name}, {weatherData.location.country}</h2>
      <p>Temperature: {weatherData.current.temp_c}°C / {weatherData.current.temp_f}°F</p>
      <p>Condition: {weatherData.current.condition.text}</p>
      <p>Humidity: {weatherData.current.humidity}%</p>
      <p>Wind: {weatherData.current.wind_kph} kph ({weatherData.current.wind_mph} mph) {weatherData.current.wind_dir}</p>
      <img src={`http:${weatherData.current.condition.icon}`} alt="Weather Icon" className="weather-icon" />
    </div>
  );
};

export default WeatherDetails;
