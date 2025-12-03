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
			t.Errorf("expected POST method, got %s", r.Method)
		}

		if r.URL.Path != "/api/weather" {
			t.Errorf("expected endpoint /api/weather, got %s", r.URL.Path)
		}

		var payload domain.WeatherPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("error decoding JSON: %v", err)
		}

		if payload.City != "Gotham" {
			t.Errorf("expected City Gotham, got %s", payload.City)
		}

		if payload.Temperature != 20.0 {
			t.Errorf("expected Temperature 20.0, got %v", payload.Temperature)
		}

		w.WriteHeader(http.StatusCreated)
	}))
	defer mockServer.Close()

	consumer := NewRabbitMQConsumer("amqp://fake", "queue", mockServer.URL)

	payload := buildWeatherPayload()

	err := consumer.postToAPI(payload)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestPostToAPI_Failure(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}))
	defer mockServer.Close()

	consumer := NewRabbitMQConsumer("amqp://fake", "queue", mockServer.URL)

	payload := buildWeatherPayload()

	err := consumer.postToAPI(payload)

	if err == nil {
		t.Fatal("expected error, got nil")
	}

	httpErr, ok := err.(*HttpError)
	if !ok {
		t.Fatalf("expected HttpError, got %T", err)
	}

	if httpErr.Status != "500 Internal Server Error" {
		t.Errorf("expected status 500 Internal Server Error, got %s", httpErr.Status)
	}
}
