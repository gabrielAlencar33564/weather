import requests
import logging
from datetime import datetime
from config.settings import CITY_LAT, CITY_LON, API_URL, CITY_NAME

logger = logging.getLogger(__name__)

def get_weather_data():
    try:
        logger.info(f"🌤️ Buscando dados meteorológicos para Lat: {CITY_LAT}, Lon: {CITY_LON}")
        
        params = {
            "latitude": CITY_LAT,
            "longitude": CITY_LON,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
            "hourly": "precipitation_probability",
            "forecast_days": 1,
            "timezone": "America/Sao_Paulo"
        }
        
        response = requests.get(API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        current = data.get('current', {})
        hourly = data.get('hourly', {})
        
        current_hour_index = datetime.now().hour
        rain_prob = 0

        if 'precipitation_probability' in hourly:
             rain_prob = hourly['precipitation_probability'][current_hour_index] if len(hourly['precipitation_probability']) > current_hour_index else 0

        payload = {
            "city": CITY_NAME,
            "location": {
                "lat": CITY_LAT,
                "lon": CITY_LON
            },
            "timestamp": current.get('time'),
            "temperature": current.get('temperature_2m'),      
            "humidity": current.get('relative_humidity_2m'),    
            "wind_speed": current.get('wind_speed_10m'),        
            "condition_code": current.get('weather_code'),      
            "is_day": current.get('is_day'),                    
            "rain_probability": rain_prob                       
        }

        return payload

    except Exception as e:
        logger.error(f"❌ Falha na requisição HTTP: {e}")
        return None