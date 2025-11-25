import time
from config.settings import CITY_LAT, CITY_LON, CITY_NAME

def generate_insights(data):
    if not data or 'current' not in data:
        return None

    current = data['current']
    temp = current.get('temperature_2m', 0)
    humidity = current.get('relative_humidity_2m', 0)
    w_code = current.get('weather_code', 0)

    insight_text = "Clima estável."
    severity = "low"

    if temp > 32:
        insight_text = "🔥 Calor extremo! Risco de insolação."
        severity = "high"
    elif temp > 28 and humidity < 30:
        insight_text = "🌵 Ar seco e quente. Beba água."
        severity = "medium"
    elif w_code >= 95:
        insight_text = "⛈️ Tempestade elétrica detectada."
        severity = "high"
    elif w_code >= 61:
        insight_text = "☔ Chuva constante."
        severity = "medium"
    elif temp < 18:
        insight_text = "❄️ Temperatura baixa."
        severity = "medium"

    return {
        "sensor_data": {
            "temperature": temp,
            "humidity": humidity,
            "wind_speed": current.get('wind_speed_10m'),
            "condition_code": w_code,
            "time": current.get('time')
        },
        "ai_analysis": {
            "insight": insight_text,
            "severity": severity
        },
        "metadata": {
            "source": "Open-Meteo",
            "city": CITY_NAME,
            "location": {"lat": CITY_LAT, "lon": CITY_LON},
            "timestamp": time.time()
        }
    }