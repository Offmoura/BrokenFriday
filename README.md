# Broken Friday Lab

> Um e-commerce fictício construído propositalmente com falhas de infraestrutura para ensinar DevOps e SRE na prática.

**"Tudo pela metade do dobro!"**

A maioria dos cursos de DevOps ensina a *subir* infraestrutura. Nenhum ensina o que fazer quando ela *quebra* — que é exatamente o que acontece numa Black Friday às 23h.

O Broken Friday Lab é um marketplace simples que **já vem quebrado por design**. Cada falha é um lab. Você clona, sobe o ambiente, observa o caos e aprende a consertar.

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+
- Git

---

## Como rodar

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/BrokenFridayLab.git
cd BrokenFridayLab

# 2. Suba toda a stack
docker compose up -d

# 3. Aguarde todos os containers ficarem saudáveis (~30s)
docker compose ps
```

Acesse:

| Interface | URL |
|---|---|
| Loja (Frontend) | http://localhost |
| API (Swagger) | http://localhost:8000/docs |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| RabbitMQ | http://localhost:15672 |

Credenciais padrão: Grafana `admin/admin` · RabbitMQ `admin/admin`

---

## Arquitetura

```
[ Browser ]
     |
     v porta 80
  [ NGINX ]  ──── /              ──► Frontend estático (SPA)
     |        ──── /api/*        ──► API FastAPI (porta 8000)
     |
  [ API FastAPI ]
     |         |         |
     v         v         v
[PostgreSQL] [Redis]  [RabbitMQ]
  (dados)    (cache)   (filas)

[ Prometheus ] ──scrape──► api:8000/metrics
      |
      v datasource
  [ Grafana ]
```

---

## Stack

| Camada | Tecnologia |
|---|---|
| API | FastAPI (Python 3.12) |
| Banco de dados | PostgreSQL 15 |
| Cache | Redis 6.2 |
| Filas | RabbitMQ 3 |
| Frontend | HTML/CSS/JS (SPA puro) |
| Proxy / LB | NGINX |
| Métricas | Prometheus + Grafana |
| Orquestração | Docker Compose |

---

## Fluxo da Loja

```
/produtos  →  /produto/:id  →  /checkout  →  /pedido-confirmado
 Vitrine       Detalhe          Pagamento      Confirmação
```

---

## Os 6 Labs

Cada lab simula uma falha real de produção. Você recebe o sintoma, investiga com as ferramentas certas e aplica a correção.

### SRE — Confiabilidade e Observabilidade

| Lab | Cenário | Conceitos |
|---|---|---|
| **Lab 01** | O Banco Travou | Query N+1, connection pooling, `pg_stat_activity` |
| **Lab 03** | O Estoque Vendeu Mais do que Tinha | Race condition, `SELECT FOR UPDATE`, transações ACID |
| **Lab 04** | Ninguém Sabia que Estava Falhando | Golden Signals, SLOs, alerting, Dead Letter Queue |

### DevOps — Escalabilidade e Deploy

| Lab | Cenário | Conceitos |
|---|---|---|
| **Lab 02** | A API Não Aguentou | Horizontal scaling, rate limiting, NGINX upstream |
| **Lab 05** | Tudo Ficou Lento | Cache-Aside, Redis TTL, cache invalidation |
| **Lab 06** | O Deploy Quebrou Tudo | Zero-downtime deploy, health checks, rollback |

### Como usar um lab

```bash
# Leia o cenário e o contexto
cat labs/lab-01-banco-travou/README.md

# Injete a falha (quando disponível)
bash labs/lab-01-banco-travou/inject.sh

# Observe o sistema degradar via Grafana (localhost:3000)

# Aplique o fix e valide que as métricas voltam ao normal
```

---

## Estrutura do Repositório

```
BrokenFridayLab/
├── app/
│   ├── api/          # FastAPI — main.py, models.py, schemas.py, database.py, config.py
│   ├── frontend/     # SPA — index.html, style.css, app.js
│   └── worker/       # Consumer RabbitMQ (em desenvolvimento)
├── infra/
│   ├── postgres/     # init.sql (schema + seeds)
│   ├── prometheus/   # prometheus.yml
│   ├── nginx/        # nginx.conf
│   └── grafana/      # dashboards
├── labs/             # Lab 01 a 06
├── docker-compose.yml
└── LICENSE
```

---

## Comandos Úteis

```bash
# Ver logs em tempo real de um serviço
docker compose logs -f api

# Acessar o banco via psql
docker compose exec postgres psql -U postgres -d brokenfridaylab

# Acessar o Redis CLI
docker compose exec redis redis-cli -a sua_senha_aqui

# Derrubar a stack (mantém os dados)
docker compose stop

# Reset total (apaga volumes)
docker compose down -v
```

---

## CI

O repositório tem uma pipeline de validação contínua com GitHub Actions que roda a cada push:

- **validate-compose** — valida sintaxe do `docker-compose.yml`
- **build-api** — constrói a imagem Docker da API do zero
- **lint-python** — análise estática do código com `flake8`

---

## Licença

[MIT](LICENSE)
