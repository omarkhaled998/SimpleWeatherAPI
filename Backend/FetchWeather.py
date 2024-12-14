from flask import Flask, jsonify
import requests
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from datetime import datetime, timedelta
import pandas as pd
from sklearn.linear_model import LinearRegression
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY')
RAPIDAPI_HOST = os.getenv('RAPIDAPI_HOST')


# Swagger UI setup
SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(SWAGGER_URL, API_URL, config={'app_name': "Weather API"})
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# Global counter for load balancing
counter = 0

def fetch_weather(location):
    global counter
    if counter % 2 == 0:
        openweather_url = f'http://api.weatherapi.com/v1/current.json?key={OPENWEATHER_API_KEY}&q={location}&aqi=no'
        response = requests.get(openweather_url)
    else:
        url = f"https://weatherapi-com.p.rapidapi.com/forecast.json"
        querystring = {"q": location}
        headers = {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST
        }
        response = requests.get(url, headers=headers, params=querystring)
    counter += 1
    return response.json()

@app.route('/weather/<location>', methods=['GET'])
def get_weather(location):
    openweather_response = fetch_weather(location)
    data = {
        'openweather': openweather_response
    }
    return jsonify(data)

@app.route('/predict-weather/<location>', methods=['GET'])
def predict_weather(location):
    try:
        history_data = []
        current_hour = int(datetime.now().strftime('%H'))
        
        # Fetch historical data for the past few days
        for i in range(1, 9):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            history_url = f'http://api.weatherapi.com/v1/history.json?key={OPENWEATHER_API_KEY}&q={location}&dt={date}'
            history_response = requests.get(history_url)
            history_response.raise_for_status()
            historical_weather = history_response.json()
            
            # Get the observed weather data for the current hour and next hour in past days
            current_hour_data = historical_weather['forecast']['forecastday'][0]['hour'][current_hour]
            next_hour_data = historical_weather['forecast']['forecastday'][0]['hour'][current_hour + 1]
            history_data.append({
                'date': date,
                'temp_c': current_hour_data['temp_c'],
                'humidity': current_hour_data['humidity'],
                'wind_kph': current_hour_data['wind_kph'],
                'next_hour_temp': next_hour_data['temp_c']  # Target variable
            })

        # Save historical data to CSV
        df = pd.DataFrame(history_data)
        df.to_csv('weather_data.csv', index=False)

        # Train the model with historical data
        X = df[['temp_c', 'humidity', 'wind_kph']]
        y = df['next_hour_temp']
        
        model = LinearRegression()
        model.fit(X, y)

        # Fetch the current weather data
        current_weather_url = f'http://api.weatherapi.com/v1/current.json?key={OPENWEATHER_API_KEY}&q={location}&aqi=no'
        current_weather_response = requests.get(current_weather_url).json()
        current_weather = current_weather_response['current']
        current_temp = current_weather['temp_c']
        current_humidity = current_weather['humidity']
        current_wind_kph = current_weather['wind_kph']

        # Predict the temperature for the next hour using current weather data
        predicted_temp = model.predict([[current_temp, current_humidity, current_wind_kph]])

        return jsonify({'predicted_temp': predicted_temp[0]})
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500




@app.route('/sunrise-sunset/<location>', methods=['GET'])
def get_sunrise_sunset(location):
    url = f"https://weatherapi-com.p.rapidapi.com/forecast.json"
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
    }
    querystring = {"q": location}
    response = requests.get(url, headers=headers, params=querystring)
    data = response.json()
    
    weather = data['current']['temp_c']
    forecast = data['forecast']['forecastday'][0]
    sunrise = datetime.strptime(forecast['astro']['sunrise'], '%I:%M %p').time()
    sunset = datetime.strptime(forecast['astro']['sunset'], '%I:%M %p').time()
    
    current_time = datetime.now().time()
    hours_before_sunset = (datetime.combine(datetime.today(), sunset) - timedelta(hours=3)).time()

    if sunrise <= current_time <= hours_before_sunset:
        weather = weather+0.5
    else:
        weather = weather-0.5
    
    return jsonify({
        'predicted_temp': weather
    })



if __name__ == '__main__':
    app.run(debug=True)
