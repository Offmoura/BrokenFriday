# app/api/Dockerfile

# 1. Imagem base: Python 3.12 na versão "slim" (menor, sem pacotes desnecessários)
FROM python:3.12-slim

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app/api

# 3. Instala dependências do sistema necessárias para compilar o psycopg2
#    (driver Python para PostgreSQL). O --no-install-recommends evita inchaço.
#    O rm -rf limpa o cache do apt para manter a imagem menor.
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# 4. Copia APENAS o requirements.txt primeiro (antes do código)
#    Isso aproveita o cache de camadas do Docker: se o código mudar mas as
#    dependências não, o Docker reutiliza a camada de pip install — muito mais rápido.
COPY requirements.txt .

# 5. Instala as dependências Python sem cache local (mantém a imagem menor)
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copia o restante do código da API para dentro do container
COPY . .

# 7. Documenta que o container escuta na porta 8000 (não abre a porta, só documenta)
EXPOSE 8000

# 8. Comando que roda quando o container sobe
#    --host 0.0.0.0 → aceita conexões de fora do container (obrigatório)
#    --port 8000   → porta interna do uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]