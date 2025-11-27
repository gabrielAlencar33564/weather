import pytest
import json
from unittest.mock import patch, MagicMock
from infra.messaging import RabbitMQClient

def test_rabbitmq_publish_success():
    with patch('infra.messaging.pika.BlockingConnection') as mock_connection:
        mock_channel = MagicMock()
        mock_connection.return_value.channel.return_value = mock_channel
        
        client = RabbitMQClient()
        payload = {"teste": "dados"}
        
        result = client.publish(payload)
        
        assert result is True
        
        mock_channel.queue_declare.assert_called_with(queue='weather_data', durable=True)
        
        mock_channel.basic_publish.assert_called()
        args, kwargs = mock_channel.basic_publish.call_args
        
        assert kwargs['body'] == json.dumps(payload)

def test_rabbitmq_connection_error():
    with patch('infra.messaging.pika.BlockingConnection') as mock_connection:
        mock_connection.side_effect = Exception("Connection Refused")
        
        client = RabbitMQClient()
        result = client.publish({"teste": "falha"})
        
        assert result is False