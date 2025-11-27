import pytest
from unittest.mock import patch, Mock
from services.weather_api import get_weather_data

# Fixture: Dados falsos que simulam a resposta da Open-Meteo
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
            # Simulando um array de 24h de probabilidades
            "precipitation_probability": [0, 0, 0, 10, 20, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    }

def test_get_weather_data_success(mock_open_meteo_response):
    """Testa se a função retorna o payload formatado corretamente quando a API responde 200 OK"""
    
    with patch('services.weather_api.requests.get') as mock_get:
        # Configura o mock para retornar nossos dados falsos
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = mock_open_meteo_response

        # Executa a função
        result = get_weather_data()

        # Validações (Assertions)
        assert result is not None
        assert result['temperature'] == 25.5
        assert result['humidity'] == 60
        assert 'rain_probability' in result
        # Verifica se lat/lon foram inseridos no payload
        assert 'location' in result
        assert 'lat' in result['location']

def test_get_weather_data_api_failure():
    """Testa se a função retorna None e não quebra quando a API dá erro"""
    
    with patch('services.weather_api.requests.get') as mock_get:
        # Simula um erro 500 (Internal Server Error) da API externa
        mock_get.return_value.status_code = 500
        mock_get.return_value.raise_for_status.side_effect = Exception("Erro 500")

        result = get_weather_data()

        # O esperado é que a função capture o erro no try/except e retorne None
        assert result is None