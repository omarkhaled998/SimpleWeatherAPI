import React, { useState } from 'react';
import axios from 'axios';
import InputForm from './InputForm';
import WeatherDetails from './WeatherDetails';
import Prediction from './Prediction';
import LocationFetcher from './LocationFetcher'
import '../Styles/WeatherDashboard.css'; // Update the import path

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState('');
  const [isLocationSet, setIsLocationSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [predictionSimple, setPredictionSimple] = useState(null);
  const [predictionComplex, setPredictionComplex] = useState(null);


  const fetchWeather = async (location) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/weather/${location}`);
      setWeatherData(response.data.openweather);
    } catch (error) {
      console.error('Error fetching the weather data', error); 
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async (location) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/predict-weather/${location}`);
      setPredictionComplex(response.data.predicted_temp);
    } catch (error) {
      console.error('Error fetching the prediction', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictionBasic = async (location) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/sunrise-sunset/${location}`);
      setPredictionSimple(response.data.predicted_temp);
    } catch (error) {
      console.error('Error fetching the prediction', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSetLocation = () => {
    fetchWeather(location);
    setIsLocationSet(true);
  };

  const handlePredictWeather = () => {
    fetchPrediction(location);
  };
  const handlePredictWeatherBasic = () => {
    fetchPredictionBasic(location);
  };

  const handleChangeLocation = () => {
    setIsLocationSet(false);
    setLocation('');
    setWeatherData(null);
    setPredictionSimple(null);
    predictionComplex(null);
  };

  return (
    <div className="weather-dashboard">
      <h1>Weather Dashboard</h1>
      <LocationFetcher />
      {!isLocationSet ? (
        <InputForm location={location} setLocation={setLocation} handleSetLocation={handleSetLocation} />
      ) : (
        <>
          {loading && <p>Loading...</p>}
          {weatherData && weatherData.location && weatherData.current && (
            <>
              <WeatherDetails weatherData={weatherData} />
              <Prediction handlePredictWeather={handlePredictWeatherBasic} prediction={predictionSimple} type="Simple"/>
              <Prediction handlePredictWeather={handlePredictWeather} prediction={predictionComplex} type="Complex" />
              <button onClick={handleChangeLocation} className="change-location-button">Change Location</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default WeatherDashboard;
