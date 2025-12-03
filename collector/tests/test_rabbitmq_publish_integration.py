import os
import json
import time

import pika
import pytest

import infra.messaging as messaging
from infra.messaging import RabbitMQClient


@pytest.mark.integration
def test_rabbitmq_publish_and_consume():
    rabbit_url = os.getenv("RABBITMQ_URL")
    if not rabbit_url:
        pytest.skip("RABBITMQ_URL não configurada para teste de integração")

    base_queue = os.getenv("QUEUE_NAME", "weather_data_test")
    test_queue = f"{base_queue}_integration"

    messaging.QUEUE_NAME = test_queue

    params = pika.URLParameters(rabbit_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=test_queue, durable=True)
    channel.queue_purge(queue=test_queue)

    client = RabbitMQClient()
    payload = {
        "temperature": 26.5,
        "timestamp": "2025-01-01T12:00:00Z",
        "city": "Cidade Teste"
    }

    result = client.publish(payload)
    assert result is True

    message_body = None
    for _ in range(5):
        method_frame, header_frame, body = channel.basic_get(queue=test_queue, auto_ack=True)
        if method_frame:
            message_body = body
            break
        time.sleep(0.5)

    connection.close()

    assert message_body is not None
    decoded = json.loads(message_body)
    assert decoded["temperature"] == payload["temperature"]
    assert decoded["city"] == payload["city"]
    assert decoded["timestamp"] == payload["timestamp"]
