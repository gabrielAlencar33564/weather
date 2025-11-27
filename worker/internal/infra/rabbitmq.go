package infra

import (
	"bytes"
	"encoding/json"
	"gdash-worker/internal/domain"
	"log"
	"net/http"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQConsumer struct {
	ConnURL    string
	QueueName  string
	ApiURL     string
	httpClient *http.Client
}

func NewRabbitMQConsumer(url, queue, apiUrl string) *RabbitMQConsumer {
	return &RabbitMQConsumer{
		ConnURL:   url,
		QueueName: queue,
		ApiURL:    apiUrl,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (r *RabbitMQConsumer) Start() {
	var conn *amqp.Connection
	var err error

	for {
		conn, err = amqp.Dial(r.ConnURL)
		if err == nil {
			log.Println("Conectado ao RabbitMQ")
			break
		}
		log.Printf("Aguardando RabbitMQ... (%s)", err)
		time.Sleep(5 * time.Second)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal(err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		r.QueueName, true, false, false, false, nil,
	)
	if err != nil {
		log.Fatal(err)
	}

	msgs, err := ch.Consume(
		q.Name, "", false, false, false, false, nil,
	)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Worker ouvindo fila: %s", q.Name)

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			var payload domain.WeatherPayload
			if err := json.Unmarshal(d.Body, &payload); err != nil {
				log.Printf("JSON Inválido: %v", err)
				d.Nack(false, false)
				continue
			}

			if err := r.postToAPI(payload); err != nil {
				log.Printf("Falha ao enviar para API: %v", err)
				d.Nack(false, true)
				time.Sleep(2 * time.Second)
				continue
			}

			d.Ack(false)
		}
	}()

	<-forever
}

func (r *RabbitMQConsumer) postToAPI(data domain.WeatherPayload) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	resp, err := r.httpClient.Post(r.ApiURL+"/api/weather", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return &HttpError{Status: resp.Status}
	}

	log.Printf("Repassado: %s | %.1fC", data.City, data.Temperature)
	return nil
}

type HttpError struct {
	Status string
}

func (e *HttpError) Error() string { return "API retornou erro: " + e.Status }