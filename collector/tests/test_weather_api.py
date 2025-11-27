import pytest
from unittest.mock import patch, Mock
from services.weather_api import get_weather_data

@pytest.fixture
def mock_open_meteo_response():
    return {
        "current": {
            "time": "2023-10-25T10:00",
            "temperature_2m": 25.5,
            "relative_humidity_2m": 60,
            "wind_speed_10m": 15.2,
            "weather_code": 1,
            "is_day": 1
        },
        "hourly": {
            "precipitation_probability": [0, 0, 0, 10, 20, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    }

def test_get_weather_data_success(mock_open_meteo_response):
    with patch('services.weather_api.requests.get') as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_open_meteo_response

        result = get_weather_data()

        assert result is not None
        assert result['temperature'] == 25.5
        assert result['humidity'] == 60
        assert 'rain_probability' in result
        assert 'location' in result
        assert 'lat' in result['location']

def test_get_weather_data_api_failure():
    with patch('services.weather_api.requests.get') as mock_get:
        mock_get.return_value.status_code = 500
        mock_get.return_value.raise_for_status.side_effect = Exception("Erro 500")

        result = get_weather_data()

        assert result is None