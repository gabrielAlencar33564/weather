import pika
import json
import logging
from config.settings import RABBITMQ_URL, QUEUE_NAME

logger = logging.getLogger(__name__)

class RabbitMQClient:
    def __init__(self):
        self.url = RABBITMQ_URL
        self.queue = QUEUE_NAME

    def publish(self, payload):
        connection = None
        try:
            params = pika.URLParameters(self.url)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.queue_declare(queue=self.queue, durable=True)

            body = json.dumps(payload)
            
            channel.basic_publish(
                exchange='',
                routing_key=self.queue,
                body=body,
                properties=pika.BasicProperties(
                    delivery_mode=2,  
                )
            )

            logger.info(f"📤 [RabbitMQ] Dados enviados: {payload.get('temperature', '?')}°C | {payload.get('timestamp')}")
            return True

        except Exception as e:
            logger.error(f"❌ [RabbitMQ] Erro de conexão: {e}")
            return False
        finally:
            if connection and connection.is_open:
                connection.close()