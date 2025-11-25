import time
import schedule
import logging
from services.weather_api import get_weather_data
from services.ai_processor import generate_insights
from infra.messaging import RabbitMQClient

logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("Main")

def job():
    raw_data = get_weather_data()
    
    if raw_data:
        processed_data = generate_insights(raw_data)
        
        if processed_data:
            mq = RabbitMQClient()
            mq.publish(processed_data)

def start():
    logger.info("🚀 Coletor Iniciado (Modularizado)")
    
    job()
    
    schedule.every(2).minutes.do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    time.sleep(5)
    start()