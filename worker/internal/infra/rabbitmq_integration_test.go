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
		t.Skip("RABBITMQ_URL não definida; ignorando teste de integração")
	}

	baseQueue := os.Getenv("QUEUE_NAME")
	if baseQueue == "" {
		baseQueue = "weather_data"
	}

	queueName := baseQueue + "_integration"

	done := make(chan domain.WeatherPayload, 1)

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

		done <- payload
		w.WriteHeader(http.StatusCreated)
	}))
	defer mockServer.Close()

	consumer := NewRabbitMQConsumer(rabbitURL, queueName, mockServer.URL)

	go consumer.Start()

	time.Sleep(2 * time.Second)

	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		t.Fatalf("falha ao conectar ao RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		t.Fatalf("falha ao abrir canal: %v", err)
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
		t.Fatalf("falha ao declarar fila: %v", err)
	}

	payload := buildWeatherPayload()
	body, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("falha ao serializar payload: %v", err)
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
		t.Fatalf("falha ao publicar mensagem de teste: %v", err)
	}

	select {
	case received := <-done:
		if received.City != payload.City {
			t.Errorf("esperava cidade %s, mas recebeu %s", payload.City, received.City)
		}
	case <-time.After(10 * time.Second):
		t.Fatal("tempo esgotado aguardando o worker consumir a mensagem e chamar a API")
	}
}
