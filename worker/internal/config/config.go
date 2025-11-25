package config

import (
	"os"
)

type Config struct {
	RabbitMQURL string
	QueueName string
	APIURL string
}

func Load() *Config {
	return &Config{
		RabbitMQURL: getEnv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/"),
		QueueName: getEnv("QUEUE_NAME", "weather_data"),
		APIURL: getEnv("API_URL", "http://backend:3000"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}