package infra

import (
	"encoding/json"
	"gdash-worker/internal/domain"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func TestWorkerIntegration_RabbitMQToAPI(t *testing.T) {
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		t.Skip("RABBITMQ_URL not set; skipping integration test")
	}

	baseQueue := os.Getenv("QUEUE_NAME")
	if baseQueue == "" {
		baseQueue = "weather_data"
	}

	queueName := baseQueue + "_integration"

	done := make(chan domain.WeatherPayload, 1)

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

		done <- payload
		w.WriteHeader(http.StatusCreated)
	}))
	defer mockServer.Close()

	consumer := NewRabbitMQConsumer(rabbitURL, queueName, mockServer.URL)

	go consumer.Start()

	time.Sleep(2 * time.Second)

	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		t.Fatalf("failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		t.Fatalf("failed to open channel: %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		queueName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		t.Fatalf("failed to declare queue: %v", err)
	}

	payload := buildWeatherPayload()
	body, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("failed to marshal payload: %v", err)
	}

	err = ch.Publish(
		"",
		q.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	if err != nil {
		t.Fatalf("failed to publish test message: %v", err)
	}

	select {
	case received := <-done:
		if received.City != payload.City {
			t.Errorf("expected city %s, got %s", payload.City, received.City)
		}
	case <-time.After(10 * time.Second):
		t.Fatal("timeout waiting for worker to consume message and call API")
	}
}
