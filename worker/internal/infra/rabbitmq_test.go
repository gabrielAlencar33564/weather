package infra

import (
	"encoding/json"
	"gdash-worker/internal/domain"
	"net/http"
	"net/http/httptest"
	"testing"
)

func buildWeatherPayload() domain.WeatherPayload {
	var payload domain.WeatherPayload

	payload.Location.Lat = "-10"
	payload.Location.Lon = "-20"
	payload.Timestamp = "2025-01-01T12:00:00Z"
	payload.Temperature = 20.0
	payload.Humidity = 80
	payload.WindSpeed = 5.5
	payload.ConditionCode = 200
	payload.RainProbability = 30
	payload.City = "Gotham"

	return payload
}

func TestPostToAPI_Success(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("esperava método POST, mas recebeu %s", r.Method)
		}

		if r.URL.Path != "/api/weather" {
			t.Errorf("esperava endpoint /api/weather, mas recebeu %s", r.URL.Path)
		}

		var payload domain.WeatherPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("erro ao decodificar JSON: %v", err)
		}

		if payload.City != "Gotham" {
			t.Errorf("esperava cidade Gotham, mas recebeu %s", payload.City)
		}

		if payload.Temperature != 20.0 {
			t.Errorf("esperava temperatura 20.0, mas recebeu %v", payload.Temperature)
		}

		w.WriteHeader(http.StatusCreated)
	}))
	defer mockServer.Close()

	consumer := NewRabbitMQConsumer("amqp://fake", "queue", mockServer.URL)

	payload := buildWeatherPayload()

	err := consumer.postToAPI(payload)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
}

func TestPostToAPI_Failure(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
	}))
	defer mockServer.Close()

	consumer := NewRabbitMQConsumer("amqp://fake", "queue", mockServer.URL)

	payload := buildWeatherPayload()

	err := consumer.postToAPI(payload)

	if err == nil {
		t.Fatal("esperava erro, mas recebeu nil")
	}

	httpErr, ok := err.(*HttpError)
	if !ok {
		t.Fatalf("esperava HttpError, mas recebeu %T", err)
	}

	if httpErr.Status != "500 Internal Server Error" {
		t.Errorf("esperava status 500 Internal Server Error, mas recebeu %s", httpErr.Status)
	}
}
