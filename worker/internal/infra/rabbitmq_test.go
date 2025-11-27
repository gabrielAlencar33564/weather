package infra

import (
	"encoding/json"
	"gdash-worker/internal/domain"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestPostToAPI_Success(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("Expected POST method, got %s", r.Method)
		}

		if r.URL.Path != "/api/weather" {
			t.Errorf("Expected endpoint /api/weather, got %s", r.URL.Path)
		}

		var payload domain.WeatherPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("Error decoding JSON: %v", err)
		}

		if payload.City != "Gotham" {
			t.Errorf("Expected City Gotham, got %s", payload.City)
		}

		w.WriteHeader(http.StatusCreated)
	}))
	defer mockServer.Close()

	consumer := NewRabbitMQConsumer("amqp://fake", "queue", mockServer.URL)
	
	payload := domain.WeatherPayload{
		City:        "Gotham",
		Temperature: 20.0,
		Location: struct {
			Lat string `json:"lat"`
			Lon string `json:"lon"`
		}{Lat: "-10", Lon: "-20"},
	}

	err := consumer.postToAPI(payload)

	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}
}

func TestPostToAPI_Failure(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}))
	defer mockServer.Close()

	consumer := NewRabbitMQConsumer("amqp://fake", "queue", mockServer.URL)
	
	payload := domain.WeatherPayload{City: "FailCity"}

	err := consumer.postToAPI(payload)

	if err == nil {
		t.Fatal("Expected error 500, got nil")
	}
}