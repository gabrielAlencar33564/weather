import os
import json
import time

import pika
import pytest

import infra.messaging as messaging
from main import job


@pytest.mark.integration
def test_job_sends_weather_payload_to_queue():
    rabbit_url = os.getenv("RABBITMQ_URL")
    if not rabbit_url:
        pytest.skip("RABBITMQ_URL não configurada para teste de integração")

    base_queue = os.getenv("QUEUE_NAME", "weather_data_test")
    test_queue = f"{base_queue}_job_integration"

    original_queue_name = messaging.QUEUE_NAME
    messaging.QUEUE_NAME = test_queue

    try:
        params = pika.URLParameters(rabbit_url)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue=test_queue, durable=True)
        channel.queue_purge(queue=test_queue)

        job()

        method_frame = None
        body = None

        for _ in range(10):
            method_frame, header_frame, body = channel.basic_get(
                queue=test_queue,
                auto_ack=True,
            )
            if method_frame:
                break
            time.sleep(1.0)

        connection.close()

        assert method_frame is not None
        assert body is not None

        data = json.loads(body)
        assert "city" in data
        assert data["city"]
        assert "location" in data
        assert "temperature" in data
        assert data["temperature"] is not None
    finally:
        messaging.QUEUE_NAME = original_queue_name
