package main

import (
	"gdash-worker/internal/config"
	"gdash-worker/internal/infra"
	"log"
)

func main() {
	log.Println("🐹 Iniciando Worker Go...")

	cfg := config.Load()

	consumer := infra.NewRabbitMQConsumer(cfg.RabbitMQURL, cfg.QueueName, cfg.APIURL)

	consumer.Start()
}