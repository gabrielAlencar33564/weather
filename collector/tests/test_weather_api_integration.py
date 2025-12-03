import os

import pytest

from services.weather_api import get_weather_data


@pytest.mark.integration
def test_get_weather_data_from_real_api():
    city_name = os.getenv("CITY_NAME")
    if not city_name:
        pytest.skip("CITY_NAME não configurada para teste de integração")

    payload = get_weather_data()

    assert payload is not None
    assert payload["city"] == city_name
    assert "location" in payload
    assert "lat" in payload["location"]
    assert "lon" in payload["location"]
    assert payload["location"]["lat"] == os.getenv("CITY_LAT")
    assert payload["location"]["lon"] == os.getenv("CITY_LON")
    assert "temperature" in payload
    assert "humidity" in payload
    assert "wind_speed" in payload
    assert "condition_code" in payload
    assert "is_day" in payload
    assert "rain_probability" in payload
