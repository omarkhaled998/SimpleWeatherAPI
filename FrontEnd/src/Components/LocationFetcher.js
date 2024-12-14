import React, { useState, useEffect } from 'react';

const LocationFetcher = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  return (
    <div>
      <h2>Your Location</h2>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <p>
          Latitude: {location.lat}, Longitude: {location.lng}
        </p>
      )}
    </div>
  );
};

export default LocationFetcher;
