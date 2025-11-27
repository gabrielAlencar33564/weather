import time
import schedule
import logging
from services.weather_api import get_weather_data 
from infra.messaging import RabbitMQClient

logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("Main")

def job():
    weather_payload = get_weather_data()
    
    if weather_payload:
        mq = RabbitMQClient()
        success = mq.publish(weather_payload)
        
        if success:
            logger.info("✅ Dados enviados para fila 'weather_data'")
        else:
            logger.warning("⚠️ Falha ao enviar para RabbitMQ")

def start():
    logger.info("🚀 Coletor Iniciado (Modo: Producer Puro)")
    
    job()
    
    schedule.every(2).minutes.do(job) 
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    logger.info("⏳ Aguardando serviços de infraestrutura...")
    time.sleep(10) 
    start()