from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import datetime
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    fake_original_price = Column(Float)
    stock = Column(Integer, default=0, nullable=False)
    type = Column(String(50), nullable=False)
    primary_color = Column(String(20))
    secondary_color = Column(String(20))

class Order(Base):
    __tablename__ = "orders"

    # We use String for UUID to be compatible with both Postgres and SQLite fallback
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(Integer, ForeignKey("products.id"), index=True, nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    amount_paid = Column(Float, nullable=False)
    status = Column(String(50), default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product")
