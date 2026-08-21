# 🤖 AGENTS.md — Contexto para Agentes de IA

> Este arquivo fornece contexto estruturado sobre o projeto **BlackFriday Lab** para agentes de IA (como GitHub Copilot, Cursor, Antigravity, etc.) que trabalham neste repositório.

---

## 🎯 O que é este projeto

**BlackFriday Lab** é um e-commerce fictício e didático chamado **Broken Friday**, construído propositalmente com falhas de infraestrutura como laboratórios de aprendizado para DevOps e SRE.

- **Lema:** *"Tudo pela metade do dobro!"*
- **Objetivo:** Ensinar como identificar, diagnosticar e corrigir falhas reais em sistemas de alta carga
- **Linguagem preferida para respostas:** Português (BR)

---

## 🏗️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| API | FastAPI (Python 3.12) |
| Banco de dados | PostgreSQL 15 |
| Cache | Redis 6.2 |
| Filas | RabbitMQ 3 |
| Frontend | HTML/CSS/JS (SPA puro, sem framework) |
| Proxy | NGINX |
| Métricas | Prometheus + Grafana |
| Orquestração | Docker Compose |

---

## 📁 Estrutura de Pastas

```
BrokenFridayLab/
├── app/
│   ├── api/           # FastAPI — main.py, models.py, schemas.py, database.py, config.py
│   ├── frontend/      # SPA puro — index.html, style.css, app.js
│   └── worker/        # Consumer RabbitMQ (ainda não implementado)
├── infra/
│   ├── postgres/      # init.sql (schema + seeds + app_user restrito)
│   ├── prometheus/    # prometheus.yml
│   ├── nginx/         # nginx.conf
│   └── grafana/       # dashboards (a configurar)
├── labs/              # Lab 01 a 06 (falhas intencionais + guias de correção)
├── docker-compose.yml # Stack saudável (base)
├── MapaDaMina.md      # Guia técnico de infraestrutura (referência)
├── BlackFriday Lab.md # Documento de concepção do projeto
└── CHANGELOG.md       # Histórico cronológico de alterações
```

---

## ⚠️ Convenções e Decisões de Projeto

### Importações Python (CRÍTICO)
Os arquivos da API usam **importações absolutas**, não relativas. O uvicorn executa `main.py` como módulo top-level:

```python
# ✅ CORRETO
import models, schemas, database
from database import Base
from config import settings

# ❌ ERRADO (quebrará o container)
from . import models, schemas, database
from .database import Base
```

### Docker Compose — Redes
Sempre usar lista de strings para `networks` em serviços:

```yaml
# ✅ CORRETO
networks:
  - blackfriday_net

# ❌ ERRADO
networks:
  - networkName: blackfriday_net
```

### Banco de dados
- Superusuário de inicialização: `postgres` / `postgres` (apenas para o `init.sql`)
- Usuário da aplicação: `app_user` / `secure_app_password_123!` (princípio do Least Privilege)
- Database: `brokenfridaylab`

### Falhas Intencionais
Alguns comportamentos são **bugs didáticos intencionais** — não corrija sem contexto:
- `main.py` → Race Condition no estoque sem `SELECT FOR UPDATE` (Lab 3)
- API sem cache Redis (Lab 5)
- Worker sem tratamento de erros silencioso (Lab 4)

---

## 📋 Estado Atual (atualizar conforme progresso)

- [x] Frontend SPA completo (`app/frontend/`)
- [x] API FastAPI funcional (`app/api/`) — rodando em Docker
- [x] Schema PostgreSQL com seeds (`infra/postgres/init.sql`)
- [x] `docker-compose.yml` com stack saudável funcional
- [x] NGINX com configuração válida (`infra/nginx/nginx.conf`)
- [x] Worker RabbitMQ (`app/worker/`)
- [ ] `docker-compose.broken.yml` com falhas ativas
- [ ] Labs 01 a 06 end-to-end
- [x] README.md público

---

## 📖 Documentos de Referência

| Arquivo | Propósito |
|---|---|
| `MapaDaMina.md` | Guia técnico de como cada serviço funciona e se conecta |
| `BlackFriday Lab.md` | Especificação completa do projeto e dos 6 labs |
| `CHANGELOG.md` | Histórico de versões e próximos passos |

> **Nota:** `MapaDaMina.md`, `BlackFriday Lab.md`, `CHANGELOG.md` e `AGENTS.md` estão no `.gitignore` — são documentos pessoais de referência, não fazem parte do repositório público.
