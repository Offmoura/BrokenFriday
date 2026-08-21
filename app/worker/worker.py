import json
import logging
import os
import time
import pika
from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("worker")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://app_user:secure_app_password_123!@postgres:5432/brokenfridaylab")
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://admin:admin@rabbitmq:5672/")

Base = declarative_base()

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True)
    product_id = Column(Integer, nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    amount_paid = Column(Float, nullable=False)
    status = Column(String(50), default="pending", nullable=False)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def process_order(ch, method, properties, body):
    db = SessionLocal()
    try:
        data = json.loads(body)
        order_id = data.get("order_id")
        logger.info(f"Processando pedido: {order_id}")

        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = "confirmed"
            db.commit()
            logger.info(f"Pedido {order_id} confirmado com sucesso.")
        else:
            logger.warning(f"Pedido {order_id} nao encontrado no banco.")

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error(f"Erro ao processar pedido: {e}")
        db.rollback()
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
    finally:
        db.close()

def main():
    while True:
        try:
            logger.info("Conectando ao RabbitMQ...")
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()

            channel.queue_declare(queue="orders_queue", durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue="orders_queue", on_message_callback=process_order)

            logger.info("Worker pronto. Aguardando mensagens na fila 'orders_queue'...")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as e:
            logger.warning(f"RabbitMQ ainda nao disponivel ({e}). Tentando novamente em 5 segundos...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"Erro inesperado no worker: {e}. Reiniciando em 5 segundos...")
            time.sleep(5)

if __name__ == "__main__":
    main()
