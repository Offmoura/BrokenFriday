-- Schema do banco de dados para o BlackFriday Lab

-- 1. Criação da role/user para a aplicação sob o Princípio do Menor Privilégio
-- (O DB 'blackfriday' será criado via variáveis de ambiente do postgres no docker-compose)
CREATE USER app_user WITH PASSWORD 'secure_app_password_123!';

-- 2. Revogando permissões padrão do schema public
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE blackfriday FROM PUBLIC;

-- 3. Criação das tabelas
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    fake_original_price DECIMAL(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    type VARCHAR(50) NOT NULL,
    primary_color VARCHAR(20),
    secondary_color VARCHAR(20)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INTEGER NOT NULL REFERENCES products(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criação de índices para performance e suporte a chaves estrangeiras
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_product_id ON orders(product_id);

-- 5. Conceder permissões apenas de DML (Data Manipulation Language) para a app_user
GRANT CONNECT ON DATABASE blackfriday TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE products TO app_user;
GRANT SELECT, INSERT, UPDATE ON TABLE orders TO app_user; -- Aplicação não deveria deletar pedidos
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO app_user;

-- 6. Seeds (Dados mockados)
INSERT INTO products (name, description, price, fake_original_price, stock, type, primary_color, secondary_color) VALUES
('Console GameStation Overpriced 5', 'Experimente gráficos incríveis gerados pela imaginação de nossa equipe de marketing. Acompanha controle que descarrega em 20 minutos e cabo HDMI de 30 centímetros. O dobro da diversão pela metade do custo de dois consoles normais!', 4999.00, 9998.00, 5, 'console', '#ff007f', '#7b2cbf'),
('Placa de Vídeo RTX 9090 Ti Sem Silício', 'A melhor placa de vídeo com Ray Tracing por software. Rodando paciência a incríveis 14 FPS. Ideal para quem quer ostentar RGB mas não liga se os jogos rodam de fato. Estoque altamente disputado por bots e mineradores falidos.', 8999.00, 17998.00, 2, 'gpu', '#00f0ff', '#390099'),
('Cadeira Gamer Ergonômica Inflacionada', 'Cadeira gamer projetada para te dar dor nas costas com o máximo de estilo. Feita de couro sintético ecológico que descasca em menos de uma semana. Inclui almofada de lombar que parece uma pedra.', 1200.00, 2400.00, 12, 'chair', '#ffb703', '#d00000'),
('Headset Ultra-Bass Estourador de Ouvido', 'Aprecie agudos estridentes e graves completamente ausentes. O microfone capta ruídos de obras vizinhas melhor do que sua própria voz. Arco feito de plástico reciclado altamente quebrável.', 350.00, 700.00, 0, 'headset', '#00f0ff', '#ff007f'),
('Teclado Mecânico Altamente Barulhento', 'Teclado com switches azuis projetado especificamente para irritar todos que moram com você ou trabalham na mesma sala. Iluminação RGB arco-íris que brilha tanto que pode ser vista do espaço sideral.', 450.00, 900.00, 15, 'generic', '#7b2cbf', '#ff007f'),
('Mouse Gamer com 12.000 DPI Inúteis', 'Ninguém consegue controlar o cursor nessa velocidade, mas soa bem na caixa. Tem 12 botões laterais que você vai apertar sem querer durante momentos críticos de jogo. Cabo trançado que embaraça sozinho.', 280.00, 560.00, 8, 'generic', '#00f0ff', '#ffb703');
