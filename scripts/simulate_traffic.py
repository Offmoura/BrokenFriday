#!/usr/bin/env python3
"""
Simulador de Tráfego e Pedidos — Broken Friday Lab

Uso:
    python scripts/simulate_traffic.py --url http://localhost --concurrency 5 --requests 100
    python scripts/simulate_traffic.py --url http://localhost --mode buy --concurrency 10
"""

import argparse
import json
import random
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

NAMES = ["Ana Silva", "Carlos Souza", "Beatriz Lima", "Diego Oliveira", "Fernanda Santos", "Gabriel Costa", "Mariana Rocha", "Lucas Pereira"]
DOMAINS = ["gmail.com", "hotmail.com", "yahoo.com.br", "outlook.com"]

class Stats:
    def __init__(self):
        self.total = 0
        self.success = 0
        self.client_errors = 0  # 4xx
        self.server_errors = 0  # 5xx
        self.orders_created = 0
        self.total_time = 0.0

    def add(self, status, elapsed, is_order=False):
        self.total += 1
        self.total_time += elapsed
        if 200 <= status < 300:
            self.success += 1
            if is_order:
                self.orders_created += 1
        elif 400 <= status < 500:
            self.client_errors += 1
        elif status >= 500:
            self.server_errors += 1

def make_request(url, method="GET", data=None, timeout=10):
    start = time.time()
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "BrokenFridaySim/1.0")

    body_bytes = json.dumps(data).encode("utf-8") if data else None

    try:
        with urllib.request.urlopen(req, data=body_bytes, timeout=timeout) as resp:
            elapsed = time.time() - start
            resp_body = resp.read().decode("utf-8")
            try:
                parsed = json.loads(resp_body) if resp_body else {}
            except json.JSONDecodeError:
                parsed = {}
            return resp.status, parsed, elapsed
    except urllib.error.HTTPError as e:
        elapsed = time.time() - start
        return e.code, {}, elapsed
    except Exception as e:
        elapsed = time.time() - start
        return 599, {}, elapsed  # Error local / connection timeout

def get_products(base_url):
    status, data, _ = make_request(f"{base_url}/api/produtos")
    if status == 200 and isinstance(data, list):
        return data
    return []

def run_user_session(base_url, mode, products, stats):
    if not products:
        # Se nao obteve produtos via API, tenta buscar novamente
        products = get_products(base_url)
        if not products:
            stats.add(500, 0)
            return

    # Escolhe acao com base no modo
    action = mode
    if mode == "mixed":
        action = random.choice(["browse", "browse", "buy"])

    if action == "browse":
        # Navega pelos produtos
        product = random.choice(products)
        status, _, elapsed = make_request(f"{base_url}/api/produtos/{product['id']}")
        stats.add(status, elapsed)
    elif action == "buy":
        # Efetua um checkout
        product = random.choice(products)
        name = random.choice(NAMES)
        email = f"{name.lower().replace(' ', '.')}@{random.choice(DOMAINS)}"

        payload = {
            "produto_id": product["id"],
            "nome_cliente": name,
            "email_cliente": email,
            "valor_pago": product.get("price", 99.9)
        }

        status, order_resp, elapsed = make_request(f"{base_url}/api/pedidos", method="POST", data=payload)
        stats.add(status, elapsed, is_order=True)

        # Se criou pedido com sucesso, consulta o status (polling)
        if status == 201 and "id" in order_resp:
            time.sleep(0.2)
            poll_status, _, poll_elapsed = make_request(f"{base_url}/api/pedidos/{order_resp['id']}")
            stats.add(poll_status, poll_elapsed)

def main():
    parser = argparse.ArgumentParser(description="Simulador de Tráfego e Compras — Broken Friday Lab")
    parser.add_argument("--url", default="http://localhost", help="URL base (ex: http://localhost ou http://localhost:8000)")
    parser.add_argument("--mode", choices=["mixed", "browse", "buy"], default="mixed", help="Modo de simulacao (mixed, browse, buy)")
    parser.add_argument("--concurrency", type=int, default=5, help="Numero de usuarios simultaneos (workers)")
    parser.add_argument("--requests", type=int, default=50, help="Quantidade total de requisicoes (0 para continuo)")
    parser.add_argument("--delay", type=float, default=0.1, help="Pausa entre requisições por usuario em segundos")

    args = parser.parse_args()

    base_url = args.url.rstrip("/")
    print(f"🚀 Iniciando simulador de tráfego no Broken Friday Lab")
    print(f"   Target: {base_url}")
    print(f"   Modo: {args.mode} | Concorrência: {args.concurrency} | Total requisições: {args.requests or 'Infinito'}\n")

    products = get_products(base_url)
    if products:
        print(f"📦 Produtos encontrados na API: {len(products)}")
    else:
        print("⚠️ Nenhum produto encontrado ou API offline. O simulador continuará tentando...")

    stats = Stats()
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
        futures = []
        count = 0

        try:
            while True:
                if args.requests > 0 and count >= args.requests:
                    break

                futures.append(executor.submit(run_user_session, base_url, args.mode, products, stats))
                count += 1
                if args.delay > 0:
                    time.sleep(args.delay)

            for future in as_completed(futures):
                future.result()

        except KeyboardInterrupt:
            print("\n⏹️ Simulação interrompida pelo usuário.")

    total_wall_time = time.time() - start_time
    avg_latency = (stats.total_time / stats.total) * 1000 if stats.total > 0 else 0
    req_per_sec = stats.total / total_wall_time if total_wall_time > 0 else 0

    print("\n" + "="*45)
    print("📊 RESULTADOS DA SIMULAÇÃO")
    print("="*45)
    print(f"Tempo total decorrido: {total_wall_time:.2f}s")
    print(f"Total de requisições:  {stats.total}")
    print(f"Taxa de transferência: {req_per_sec:.2f} req/s")
    print(f"Latência média:        {avg_latency:.2f} ms")
    print(f"Sucessos (2xx):        {stats.success}")
    print(f"Erros de cliente (4xx):{stats.client_errors}")
    print(f"Erros de servidor (5xx):{stats.server_errors}")
    print(f"Pedidos criados:       {stats.orders_created}")
    print("="*45)

if __name__ == "__main__":
    main()
