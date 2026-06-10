from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    fake_original_price: Optional[float] = None
    stock: int
    type: str
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

class OrderCreateRequest(BaseModel):
    produto_id: int
    nome_cliente: str = Field(..., min_length=2, max_length=255)
    email_cliente: EmailStr
    valor_pago: float = Field(..., gt=0)

class OrderResponse(BaseModel):
    id: str
    product_id: int
    customer_name: str
    customer_email: EmailStr
    amount_paid: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
