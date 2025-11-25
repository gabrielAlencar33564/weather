import requests
import logging
from config.settings import CITY_LAT, CITY_LON, API_URL

logger = logging.getLogger(__name__)

def get_weather_data():
    try:
        logger.info(f"🌤️ Buscando previsão para Lat: {CITY_LAT}, Lon: {CITY_LON}")
        
        params = {
            "latitude": CITY_LAT,
            "longitude": CITY_LON,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
            "timezone": "America/Sao_Paulo"
        }
        
        response = requests.get(API_URL, params=params, timeout=10)
        response.raise_for_status()
        
        return response.json()
    except Exception as e:
        logger.error(f"❌ Falha na requisição HTTP: {e}")
        return None