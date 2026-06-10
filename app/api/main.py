from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import logging

from . import models, schemas, database

# Initialize logging securely
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Create tables for SQLite fallback if used
# In production with Postgres, migrations (Alembic) or init.sql should be used.
if database.engine.url.drivername == "sqlite":
    models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="BlackFriday Lab API",
    description="API do e-commerce didático com falhas intencionais (Labs).",
    version="1.0.0"
)

# STRICT CORS Policy
# Only allow specific origins (in real world, strict origins. Here we allow localhost variations)
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------
# ENDPOINTS
# --------------------------------------------------------------------

@app.get("/api/produtos", response_model=List[schemas.ProductResponse])
def list_products(skip: int = 0, limit: int = 12, db: Session = Depends(database.get_db)):
    """
    Lista todos os produtos.
    [Lab 5] Sem Cache: Toda requisição bate no banco.
    """
    try:
        products = db.query(models.Product).offset(skip).limit(limit).all()
        return products
    except Exception as e:
        logger.error(f"Erro ao listar produtos: {str(e)}")
        # Secure Error Handling: Do not leak DB error details to client
        raise HTTPException(status_code=500, detail="Erro interno ao processar a requisição.")

@app.get("/api/produtos/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(database.get_db)):
    """
    Retorna os detalhes e estoque atual de um produto.
    """
    try:
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar produto {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a requisição.")

@app.post("/api/pedidos", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreateRequest, db: Session = Depends(database.get_db)):
    """
    Processa o checkout e cria um pedido.
    [Lab 1] O Banco Travou: Depende de conexões e query performance.
    [Lab 3] Race Condition: O estoque é atualizado sem SELECT FOR UPDATE na versão base.
    """
    try:
        # Busca o produto
        product = db.query(models.Product).filter(models.Product.id == order.produto_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
            
        if product.stock <= 0:
            raise HTTPException(status_code=400, detail="Produto fora de estoque")

        # RACE CONDITION VULNERABILITY (Intencional para o Lab 3)
        # Em um cenário real, deveríamos usar:
        # db.query(models.Product).filter(models.Product.id == order.produto_id).with_for_update().first()
        product.stock -= 1
        
        # Cria a ordem
        new_order = models.Order(
            product_id=product.id,
            customer_name=order.nome_cliente,
            customer_email=order.email_cliente,
            amount_paid=order.valor_pago,
            status="pending"
        )
        
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        # Aqui, em um cenário real (e para o Lab 4), publicaríamos a mensagem no RabbitMQ.
        # Por simplicidade nesta versão base, se RabbitMQ não está configurado, podemos 
        # apenas retornar a ordem pendente. Um worker ou processo simulado confirmaria a ordem depois.
        
        return new_order
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar pedido: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar o checkout.")

@app.get("/api/pedidos/{order_id}", response_model=schemas.OrderResponse)
def get_order_status(order_id: str, db: Session = Depends(database.get_db)):
    """
    Retorna o status de um pedido.
    """
    try:
        order = db.query(models.Order).filter(models.Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar pedido {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a requisição.")
