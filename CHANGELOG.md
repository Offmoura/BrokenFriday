# 📋 CHANGELOG — BlackFriday Lab

> Registro cronológico de tudo que foi realizado no projeto.
> Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [0.5.0] — 2026-08-21

### Adicionado
- **Worker Consumer RabbitMQ** em `app/worker/`:
  - Processador assíncrono para consumir a fila `orders_queue` e alterar status dos pedidos para `confirmed`.
  - Reconexão automática resiliente e tratamento de exceções.
  - Serviço `worker` incluído no `docker-compose.yml`.
- **Integração RabbitMQ na API Backend**:
  - Adição de `pika` e publicação automática de eventos em `/api/pedidos`.
- **Ferramenta de Simulação de Tráfego** em `scripts/simulate_traffic.py`:
  - Script Python puro para testes de carga e concorrência de checkout/navegação.
- **Documentação e Estado**:
  - `README.md` público com instruções completas do projeto.
  - Atualização do `AGENTS.md`.

---

## [0.4.0] — 2026-06-09

### Adicionado
- **API Backend (FastAPI)** no diretório `app/api/`:
  - `requirements.txt`: Dependências essenciais e seguras fixadas.
  - `config.py`: Gestão de configuração e secrets via variáveis de ambiente com fallback sqlite.
  - `database.py` e `models.py`: Modelagem de dados segura (ORM) prevenindo injeções SQL.
  - `schemas.py`: Validação de entrada restrita via Pydantic.
  - `main.py`: Endpoints REST com CORS estrito (`/api/produtos` e `/api/pedidos`). Implementação didática propensa à *Race Condition* no estoque (Lab 3 base).
- **Database Schema (PostgreSQL)** em `infra/postgres/init.sql`:
  - Aplicação do princípio de "Least Privilege": Usuário restrito `app_user` apenas com permissões de manipulação de dados (DML).
  - Tabela `products` e `orders` com dados inseridos (seeds) condizentes com o mock do frontend.

---

## [0.3.0] — 2026-06-09

### Adicionado
- **Frontend SPA da loja BlackFraude** no diretório `app/frontend/`:
  - **`index.html`** — Estrutura HTML Single Page Application mapeando as 4 páginas do fluxo (Vitrine, Detalhes, Checkout, Pedido Confirmado).
  - **`style.css`** — Design System e visual premium com tema Dark Mode neon (magenta e ciano), contornos vibrantes e animações fluidas. Lema oficial estampado: *"Tudo pela metade do dobro!"*.
  - **`app.js`** — Lógica client-side para navegação dinâmica com hash route (`#/`), filtros de busca por texto, ordenação de produtos, carrinhos de compras fictícios, integração flexível com endpoints `/api/produtos` e `/api/pedidos` (com fallback robusto local para dados mockados em caso de API offline), polling de estoque a cada 5s e polling de fila a cada 3s com transição de status.
  - **SVGs Dinâmicos** gerados programaticamente via JS para ilustração limpa e elegante dos produtos (consoles, GPUs, mouses, headsets) sem dependência de links externos.

---

## [0.2.0] — 2026-06-02

### Adicionado
- **Estrutura de pastas** do repositório criada conforme especificado no `BlackFriday Lab.md`:
  - `app/api/` — diretório para a API (FastAPI ou C# Minimal)
  - `app/frontend/` — diretório para o frontend simples
  - `app/worker/` — diretório para o consumer RabbitMQ
  - `infra/prometheus/` — configurações do Prometheus
  - `infra/grafana/` — dashboards do Grafana
  - `infra/nginx/` — configuração do NGINX (load balancer)
  - `infra/postgres/` — scripts de seed do PostgreSQL
  - `labs/lab-01-banco-travou/` — Lab SRE: query N+1, connection pooling
  - `labs/lab-02-api-sobrecarregada/` — Lab DevOps: horizontal scaling, rate limiting
  - `labs/lab-03-race-condition/` — Lab SRE: transações ACID, SELECT FOR UPDATE
  - `labs/lab-04-sem-observabilidade/` — Lab SRE: Golden Signals, SLOs, alerting
  - `labs/lab-05-sem-cache/` — Lab DevOps: Redis, caching strategies
  - `labs/lab-06-deploy-quebrado/` — Lab DevOps: zero-downtime deploy, rollback
- **`.gitkeep`** adicionado em cada diretório vazio para rastreamento pelo Git

### Alterado
- **`.gitignore`** populado com regras para toda a stack do projeto:
  - Variáveis de ambiente (`.env`, `.env.*`)
  - Python/FastAPI (`__pycache__`, `.venv`, `.pytest_cache`, etc.)
  - Node.js (`node_modules/`, `dist/`, etc.)
  - Volumes Docker locais (`postgres-data/`, `redis-data/`, `grafana-data/`, etc.)
  - Editores e IDEs (`.vscode/`, `.idea/`, `.DS_Store`, etc.)
  - Outputs de testes de carga (`k6-results/`, `*.html.report`)
  - Certificados e secrets (`*.pem`, `*.key`, `*.crt`)
  - Logs e arquivos temporários

---

## [0.1.0] — 2026-06-02

### Adicionado
- **`BlackFriday Lab.md`** — documento de concepção e especificação completa do projeto, contendo:
  - Proposta e objetivo didático do projeto
  - Arquitetura base (Docker Compose + FastAPI + PostgreSQL + Redis + RabbitMQ + Prometheus/Grafana)
  - Definição das 4 páginas do marketplace (`/produtos`, `/produto/:id`, `/checkout`, `/pedido-confirmado`)
  - Especificação dos 6 labs de falha (3 SRE + 3 DevOps)
  - Estrutura de repositório sugerida
  - Fluxo de uso para o desenvolvedor
  - Potencial de monetização (curso, workshop, consultoria)
  - Checklist de próximos passos
- **Repositório Git** inicializado
- **`.gitignore`** criado com entrada inicial (`BlackFriday Lab.md`)

---

## [Unreleased] — Próximos passos

- [ ] Implementar worker backend funcional (`app/worker`)
- [ ] Configurar Grafana datasource via provisionamento (`infra/grafana/`)
- [ ] Configurar `docker-compose.broken.yml` com todas as falhas ativas
- [ ] Implementar Labs 01 a 06 end-to-end (`inject.sh`, `fix.md`, `README.md` por lab)
- [ ] Escrever `README.md` principal com GIF demonstrativo
- [ ] Criar página de divulgação e lançar no LinkedIn e comunidades DevOps BR

---

## [0.9.0] — 2026-07-25

### Adicionado
- **Imagens Locais de Produtos** (`app/frontend/images/`) — gerados 6 renders PNG de produtos estilo cyberpunk/gamer (`console`, `gpu`, `chair`, `headset`, `keyboard`, `mouse`) servidos diretamente pelo NGINX.
- **Seção Troubleshooting (Docker x Git)** no `MapaDaMina.md` (seção 9) — documentação do problema frequente de permissão no `.git/objects` devido a uso de `sudo git` ou volumes Docker montados no workspace, acompanhado da solução `sudo chown -R $USER:$USER .git`.

### Corrigido
- **`infra/prometheus/prometheus.yml`** — removidos alvos de scraping inexistentes (`postgres-exporter` e `redis-exporter`), resolvendo erro de DNS no container.
- **`docker-compose.yml`** — alterado o volume do Grafana de `./grafana-data` (conflito de permissão de escrita root) para volume gerenciado `grafana_data:`.
- **`app/frontend/app.js`** — substituído o gerador de SVGs inline por mapeamento estático para as novas imagens de produto locais.
- **`app/api/schemas.py`** — atualizado o campo `OrderResponse.id` de `str` para `Union[str, UUID]` para aceitar a coerção do tipo UUID do PostgreSQL sem falhar a validação no Pydantic v2.
- **`infra/postgres/init.sql`** — ajustados os tipos dos produtos 5 e 6 para `keyboard` e `mouse` e corrigidas referências do nome da base de dados de `blackfriday` para `brokenfridaylab`.
- **`.gitignore`** — adicionado `infra/postgres/data/` para evitar rastreamento acidental do volume local do PostgreSQL.

---

## [0.8.0] — 2026-07-18

### Corrigido
- **`app/api/main.py`** — `Instrumentator().instrument(app).expose(app)` estava posicionado nas linhas 7–8, **antes** da criação do objeto `app = FastAPI()` (linha 21), causando `NameError: name 'app' is not defined` no boot do container.
  - Import de `Instrumentator` movido para o bloco de imports no topo do arquivo.
  - Chamada `Instrumentator().instrument(app).expose(app)` movida para **após** a criação do `app` e configuração do middleware CORS — posição correta para que o `app` já exista e os middlewares já estejam registrados.
  - Este bug impedia a API de subir, bloqueando o NGINX (que tem `depends_on: api`) e consequentemente impedindo o frontend de ser servido.

---

## [0.7.0] — 2026-07-16

### Adicionado
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — pipeline de depuração básica com 3 jobs em paralelo:
  - `validate-compose` — valida sintaxe do `docker-compose.yml` com `docker compose config`
  - `build-api` — constrói a imagem Docker da API do zero
  - `lint-python` — análise estática do código Python com `flake8`
- **Briefings dos 6 Labs** — documentos de referência pessoal em `labs/*/BRIEFING.md`:
  - Lab 01: O Banco Travou — Query N+1, Connection Pooling, `pg_stat_activity`
  - Lab 02: A API Não Aguentou — Horizontal Scaling, Rate Limiting, NGINX upstream
  - Lab 03: O Estoque Vendeu Mais — Race Condition, `SELECT FOR UPDATE`, ACID
  - Lab 04: Ninguém Sabia — Golden Signals, SLO, Alerting, Dead Letter Queue
  - Lab 05: Tudo Ficou Lento — Cache-Aside, Redis TTL, Cache Invalidation
  - Lab 06: O Deploy Quebrou Tudo — Zero-Downtime, Health Check, Rollback automático
- **Seção GitHub Actions** no `MapaDaMina.md` (seção 8) — explica cada job do CI e a evolução da pipeline para os labs futuros.

### Alterado
- **`.gitignore`** — adicionado padrão `**/BRIEFING.md` para manter todos os briefings dos labs como documentos pessoais locais.

---

## [0.6.0] — 2026-07-14

### Adicionado
- **`AGENTS.md`** — arquivo de contexto estruturado para agentes de IA com stack, convenções críticas, falhas intencionais e estado atual do projeto. Adicionado ao `.gitignore`.
- **Seção sobre Dockerfile** no `MapaDaMina.md` — explica cada instrução do `app/api/Dockerfile` com foco em cache de camadas e boas práticas DevOps.
- **Seção de Status da Stack** no `MapaDaMina.md` — tabela de estado de cada componente e checklist de validação da versão saudável.

### Corrigido
- **`app/api/main.py`** — importação relativa `from . import models, schemas, database` substituída por importação absoluta `import models, schemas, database` (uvicorn executa como módulo top-level).
- **`app/api/models.py`** — `from .database import Base` → `from database import Base`.
- **`app/api/database.py`** — `from .config import settings` → `from config import settings`.
- **`app/api/requirements.txt`** — adicionado `email-validator==2.1.1`, dependência necessária para `EmailStr` do Pydantic em `schemas.py`.
- **`infra/prometheus/prometheus.yml`** — removida indentação inválida, chave `networks:` inexistente no formato Prometheus e jobs de exporters não presentes na stack base.
- **`infra/nginx/nginx.conf`** — removido bloco `upstream` posicionado fora do contexto `http {}`, que impedia o boot do NGINX.

---

## [0.5.0] — 2026-07-13

### Adicionado
- **Licença MIT** (`LICENSE`) — projeto formalmente aberto como open-source com copyright `BlackFriday Lab Contributors`.

### Corrigido
- **`docker-compose.yml`** — correções estruturais de YAML:
  - Redes (`networks`) de todos os serviços corrigidas de formato de mapa inválido (`- networkName: blackfriday_net`) para lista de strings (`- blackfriday_net`).
  - Serviço `prometheus` recebeu bloco `networks` e `depends_on` (api, postgres, redis, rabbitmq) ausentes.
  - Bloco inválido `scrape_configs` removido do serviço `prometheus` — configuração pertence ao arquivo `infra/prometheus/prometheus.yml`.
  - Redis recebeu `networks` que havia sido removida acidentalmente.
