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
	ConnURL string
	QueueName string
	ApiURL string 
}

func NewRabbitMQConsumer(url, queue, apiUrl string) *RabbitMQConsumer {
	return &RabbitMQConsumer{
		ConnURL:   url,
		QueueName: queue,
		ApiURL:    apiUrl,
	}
}

func (r *RabbitMQConsumer) Start() {
	var conn *amqp.Connection
	var err error

	for {
		conn, err = amqp.Dial(r.ConnURL)
		if err == nil {
			log.Println("✅ [Go] Conectado ao RabbitMQ!")
			break
		}
		log.Printf("⏳ [Go] Aguardando RabbitMQ... (%s)", err)
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

	log.Printf("🐹 [Go] Worker ouvindo fila: %s e enviando para %s", q.Name, r.ApiURL)

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			var data domain.WeatherData
			if err := json.Unmarshal(d.Body, &data); err != nil {
				log.Printf("❌ JSON Inválido. Descartando.")
				d.Nack(false, false)
				continue
			}

			if err := r.postToAPI(data); err != nil {
				log.Printf("⚠️ Falha ao enviar para API: %v. Devolvendo p/ fila...", err)

				d.Nack(false, true) 
				time.Sleep(2 * time.Second) 
				continue
			}

			d.Ack(false)
		}
	}()

	<-forever
}

func (r *RabbitMQConsumer) postToAPI(data domain.WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	resp, err := http.Post(r.ApiURL+"/api/weather", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return  boardCastError(resp.Status)
	}

	log.Printf("🚀 [Go -> Nest] Enviado: %s (Status: %s)", data.AiAnalysis.Insight, resp.Status)
	return nil
}

func boardCastError(status string) error {
    return &HttpError{Status: status}
}

type HttpError struct {
    Status string
}
func (e *HttpError) Error() string { return "API retornou erro: " + e.Status }