package infra

import (
	"encoding/json"
	"gdash-worker/internal/domain"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQConsumer struct {
	ConnURL string
	QueueName string
}

func NewRabbitMQConsumer(url, queue string) *RabbitMQConsumer {
	return &RabbitMQConsumer{
		ConnURL: url,
		QueueName: queue,
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
		r.QueueName, 
		true,       
		false,       
		false,       
		false,      
		nil,         
	)
	if err != nil {
		log.Fatal(err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"",     
		false,  
		false,  
		false,  
		false,  
		nil,    
	)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("🐹 [Go] Worker ouvindo fila: %s", q.Name)

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			var data domain.WeatherData
			err := json.Unmarshal(d.Body, &data)
			
			if err != nil {
				log.Printf("❌ Erro JSON: %s", err)
				d.Nack(false, false) 
				continue
			}

			log.Printf("📥 Processando: [%s] %s (%.1f°C)", 
				data.AiAnalysis.Severity, 
				data.AiAnalysis.Insight,
				data.SensorData.Temperature,
			)
			
			d.Ack(false)
		}
	}()

	<-forever
}