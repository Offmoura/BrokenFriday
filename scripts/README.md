# 🚦 Scripts de Simulação e Teste de Carga

Esta pasta contém ferramentas auxiliares para simular tráfego de usuários e compras no **Broken Friday Lab**.

---

## ⚡ Simulador de Tráfego (`simulate_traffic.py`)

Um script Python puro (sem necessidade de `pip install`) que gera requisições simultâneas de navegação e compras de produtos na loja.

### Exemplo de Uso

```bash
# Simulação mista padrão (5 usuários simultâneos, 50 requisições)
python3 scripts/simulate_traffic.py --url http://localhost

# Simulação intensa de compras (10 usuários concorrentes, 200 compras)
python3 scripts/simulate_traffic.py --url http://localhost --mode buy --concurrency 10 --requests 200

# Tráfego contínuo (roda até você apertar Ctrl+C)
python3 scripts/simulate_traffic.py --url http://localhost --concurrency 8 --requests 0
```

### Opções Disponíveis

| Parâmetro | Padrão | Descrição |
|---|---|---|
| `--url` | `http://localhost` | Endpoint base da aplicação ou NGINX |
| `--mode` | `mixed` | Modo de simulação (`mixed`, `browse`, `buy`) |
| `--concurrency` | `5` | Número de threads/usuários simultâneos |
| `--requests` | `50` | Total de requisições a enviar (`0` para contínuo) |
| `--delay` | `0.1` | Pausa (em segundos) entre envios por usuário |
