import os

API_URL = "https://api.open-meteo.com/v1/forecast"

RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
QUEUE_NAME = os.getenv('QUEUE_NAME', 'weather_data')

CITY_LAT = os.getenv('CITY_LAT', "-12.51")
CITY_LON = os.getenv('CITY_LON', "-41.57")
CITY_NAME = os.getenv('CITY_NAME', "Palmeiras - BA")