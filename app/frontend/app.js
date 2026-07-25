// Configuração da API (aponta para o mesmo host por padrão)
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://localhost:8000/api' // Ajuste conforme a porta real da API
    : '/api';

// Estado global simples do Frontend SPA
const state = {
    products: [],
    currentProduct: null,
    cartProduct: null,
    searchQuery: '',
    sortBy: 'default',
    currentPage: 1,
    itemsPerPage: 12,
    pollingIntervalId: null
};

// SVG Mocks estéticos de produtos para o site "BlackFraude"
const PRODUCT_IMAGES = {
    console: 'images/console.png',
    gpu:     'images/gpu.png',
    chair:   'images/chair.png',
    headset: 'images/headset.png',
    keyboard:'images/keyboard.png',
    mouse:   'images/mouse.png',
    generic: 'images/keyboard.png',  // fallback
};

const getProductImage = (type) => {
    const src = PRODUCT_IMAGES[type] || PRODUCT_IMAGES.generic;
    return `<img src="${src}" alt="${type}" class="product-img" loading="lazy" onerror="this.style.display='none'">`;
};


// Produtos padrão para mock e fallback caso a API não responda
const MOCK_PRODUCTS = [
    {
        id: 1,
        name: "Console GameStation Overpriced 5",
        description: "Experimente gráficos incríveis gerados pela imaginação de nossa equipe de marketing. Acompanha controle que descarrega em 20 minutos e cabo HDMI de 30 centímetros. O dobro da diversão pela metade do custo de dois consoles normais!",
        price: 4999.00,
        fake_original_price: 9998.00,
        stock: 5,
        type: "console",
        primary_color: "#ff007f",
        secondary_color: "#7b2cbf"
    },
    {
        id: 2,
        name: "Placa de Vídeo RTX 9090 Ti Sem Silício",
        description: "A melhor placa de vídeo com Ray Tracing por software. Rodando paciência a incríveis 14 FPS. Ideal para quem quer ostentar RGB mas não liga se os jogos rodam de fato. Estoque altamente disputado por bots e mineradores falidos.",
        price: 8999.00,
        fake_original_price: 17998.00,
        stock: 2,
        type: "gpu",
        primary_color: "#00f0ff",
        secondary_color: "#390099"
    },
    {
        id: 3,
        name: "Cadeira Gamer Ergonômica Inflacionada",
        description: "Cadeira gamer projetada para te dar dor nas costas com o máximo de estilo. Feita de couro sintético ecológico que descasca em menos de uma semana. Inclui almofada de lombar que parece uma pedra.",
        price: 1200.00,
        fake_original_price: 2400.00,
        stock: 12,
        type: "chair",
        primary_color: "#ffb703",
        secondary_color: "#d00000"
    },
    {
        id: 4,
        name: "Headset Ultra-Bass Estourador de Ouvido",
        description: "Aprecie agudos estridentes e graves completamente ausentes. O microfone capta ruídos de obras vizinhas melhor do que sua própria voz. Arco feito de plástico reciclado altamente quebrável.",
        price: 350.00,
        fake_original_price: 700.00,
        stock: 0, // Esgotado para testar fluxo
        type: "headset",
        primary_color: "#00f0ff",
        secondary_color: "#ff007f"
    },
    {
        id: 5,
        name: "Teclado Mecânico Altamente Barulhento",
        description: "Teclado com switches azuis projetado especificamente para irritar todos que moram com você ou trabalham na mesma sala. Iluminação RGB arco-íris que brilha tanto que pode ser vista do espaço sideral.",
        price: 450.00,
        fake_original_price: 900.00,
        stock: 15,
        type: "generic",
        primary_color: "#7b2cbf",
        secondary_color: "#ff007f"
    },
    {
        id: 6,
        name: "Mouse Gamer com 12.000 DPI Inúteis",
        description: "Ninguém consegue controlar o cursor nessa velocidade, mas soa bem na caixa. Tem 12 botões laterais que você vai apertar sem querer durante momentos críticos de jogo. Cabo trançado que embaraça sozinho.",
        price: 280.00,
        fake_original_price: 560.00,
        stock: 8,
        type: "generic",
        primary_color: "#00f0ff",
        secondary_color: "#ffb703"
    }
];

// Helper para formatar moeda
const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Carregar produtos da API ou Fallback para Mock
async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/produtos`);
        if (res.ok) {
            const data = await res.json();
            // A API deve retornar lista de produtos. Se vazia ou inválida, fallback
            state.products = data.length > 0 ? data : MOCK_PRODUCTS;
        } else {
            state.products = MOCK_PRODUCTS;
        }
    } catch (err) {
        console.warn("API offline ou lenta. Usando fallback Mock Products local.", err);
        state.products = MOCK_PRODUCTS;
    }
}

// Buscar produto específico por ID
async function fetchProductById(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/produtos/${id}`);
        if (res.ok) {
            return await res.json();
        }
    } catch (err) {
        console.warn(`Erro ao buscar produto ${id} da API. Usando mock.`, err);
    }
    return state.products.find(p => p.id === parseInt(id)) || null;
}

// Roteador Client-side Simples (SPA)
async function router() {
    // Limpa qualquer polling ativo ao mudar de view
    if (state.pollingIntervalId) {
        clearInterval(state.pollingIntervalId);
        state.pollingIntervalId = null;
    }

    const hash = window.location.hash || '#';
    const mainViews = document.querySelectorAll('.view-section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Desativa todas as views
    mainViews.forEach(v => v.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    // Rota: Detalhes do Produto
    if (hash.startsWith('#/produto/')) {
        const productId = hash.split('#/produto/')[1];
        document.getElementById('produto-view').classList.add('active');

        await renderProductDetail(productId);
        return;
    }

    // Rota: Checkout
    if (hash.startsWith('#/checkout')) {
        // Se houver query param de produto, define no estado do carrinho
        const params = new URLSearchParams(hash.split('?')[1] || '');
        const prodId = params.get('produto');
        if (prodId) {
            const prod = await fetchProductById(prodId);
            if (prod) state.cartProduct = prod;
        }

        document.getElementById('checkout-view').classList.add('active');
        document.getElementById('nav-checkout').classList.add('active');
        renderCheckout();
        return;
    }

    // Rota: Pedido Confirmado
    if (hash.startsWith('#/pedido-confirmado')) {
        const params = new URLSearchParams(hash.split('?')[1] || '');
        const orderId = params.get('orderId');
        const prodId = params.get('produto');

        document.getElementById('confirmado-view').classList.add('active');
        renderOrderConfirmation(orderId, prodId);
        return;
    }

    // Rota Default: Vitrine
    document.getElementById('vitrine-view').classList.add('active');
    document.getElementById('nav-vitrine').classList.add('active');
    await renderVitrine();
}

// ----------------------------------------
// RENDERS
// ----------------------------------------

// RENDER 1: Vitrine de Produtos
async function renderVitrine() {
    await loadProducts();
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    // Filtragem por busca (case-insensitive)
    let filtered = state.products.filter(p =>
        p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    // Ordenação
    if (state.sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === 'most-sold') {
        // Simulado: IDs pares vendem mais
        filtered.sort((a, b) => (b.id % 2) - (a.id % 2));
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-secondary);">
                Nenhum produto encontrado. Até nossos bots de fraude falharam em achar isso!
            </div>
        `;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Determina badge do estoque
        let stockBadge = `<span class="badge-stock badge-in-stock">Em Estoque</span>`;
        if (p.stock === 0) {
            stockBadge = `<span class="badge-stock badge-out-of-stock">Esgotado</span>`;
        } else if (p.stock <= 3) {
            stockBadge = `<span class="badge-stock badge-low-stock">Apenas ${p.stock} Restantes!</span>`;
        }

        // Imagem do produto a partir dos assets locais
        const imgContent = getProductImage(p.type || 'generic');

        card.innerHTML = `
            <div class="product-image-container">
                ${imgContent}
                ${stockBadge}
            </div>
            <div class="product-details">
                <h3 class="product-title">${p.name}</h3>
                <div class="price-container">
                    <span class="price-fake-original">De ${formatCurrency(p.fake_original_price || p.price * 2)}</span>
                    <div class="price-actual">${formatCurrency(p.price)}</div>
                    <span class="price-info-text">Pela Metade do Dobro!</span>
                </div>
                <a href="#/produto/${p.id}" class="btn-action">Ver Oferta Duvidosa</a>
            </div>
        `;
        grid.appendChild(card);
    });

    renderPagination();
}

// Paginação Fictícia
function renderPagination() {
    const container = document.getElementById('pagination-container');
    container.innerHTML = `
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn">2</button>
        <button class="pagination-btn">3</button>
    `;

    // Adiciona listener cosmético para animação de clique
    container.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.pagination-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// RENDER 2: Detalhes do Produto
async function renderProductDetail(id) {
    const content = document.getElementById('product-detail-content');
    content.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">Carregando produto enganoso...</div>`;

    const product = await fetchProductById(id);
    state.currentProduct = product;

    if (!product) {
        content.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--accent-danger);">Produto não encontrado no banco de fraudes!</div>`;
        return;
    }

    const updateDetailDOM = (prod) => {
        let stockBadge = `<span class="badge-stock badge-in-stock">Em Estoque</span>`;
        let disabledAttr = '';
        if (prod.stock === 0) {
            stockBadge = `<span class="badge-stock badge-out-of-stock">Esgotado</span>`;
            disabledAttr = 'disabled';
        } else if (prod.stock <= 3) {
            stockBadge = `<span class="badge-stock badge-low-stock">Restam apenas ${prod.stock} unidades!</span>`;
        }

        const imgContent = getProductImage(prod.type || 'generic');

        content.innerHTML = `
            <div class="detail-gallery">
                ${imgContent}
            </div>
            <div class="detail-info">
                <h1 class="detail-title">${prod.name}</h1>
                <div class="detail-stock-badge-container">
                    ${stockBadge}
                </div>
                <p class="detail-description">${prod.description}</p>
                <div class="detail-price-box">
                    <span class="price-fake-original">Preço sugerido: ${formatCurrency(prod.fake_original_price || prod.price * 2)}</span>
                    <div class="price-actual" style="font-size: 2rem;">${formatCurrency(prod.price)}</div>
                    <span class="price-info-text" style="font-size: 0.85rem;">Preço final ajustado no carrinho (mais taxas simuladas)</span>
                </div>
                <button class="btn-action" id="btn-add-to-cart" ${disabledAttr}>
                    ${prod.stock > 0 ? 'Garantir no Preço Dobrado' : 'Indisponível'}
                </button>
            </div>
        `;

        const btn = document.getElementById('btn-add-to-cart');
        if (btn) {
            btn.addEventListener('click', () => {
                state.cartProduct = prod;
                window.location.hash = `#/checkout?produto=${prod.id}`;
            });
        }
    };

    // Render Inicial
    updateDetailDOM(product);

    // LAB 3 & Polling: Polling na API de estoque a cada 5s
    state.pollingIntervalId = setInterval(async () => {
        console.log(`[Polling] Atualizando estoque do produto ${id}...`);
        const updated = await fetchProductById(id);
        if (updated) {
            state.currentProduct = updated;
            updateDetailDOM(updated);
        }
    }, 5000);
}

// RENDER 3: Checkout
function renderCheckout() {
    const summary = document.getElementById('checkout-summary-content');
    const formBtn = document.getElementById('btn-submit-order');

    if (!state.cartProduct) {
        summary.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                Carrinho vazio. Volte para a vitrine para inflacionar algum item.
            </div>
        `;
        formBtn.disabled = true;
        return;
    }

    formBtn.disabled = false;
    const prod = state.cartProduct;
    const taxValue = prod.price * 0.15; // Taxa de BlackFraude fictícia
    const total = prod.price + taxValue;

    summary.innerHTML = `
        <div class="checkout-summary-item">
            <span>${prod.name}</span>
            <span>${formatCurrency(prod.price)}</span>
        </div>
        <div class="checkout-summary-item" style="color: var(--accent-warning);">
            <span>Taxa Conveniência Simulada (+15%)</span>
            <span>${formatCurrency(taxValue)}</span>
        </div>
        <div class="checkout-summary-total">
            <span>Total da Fraude</span>
            <span>${formatCurrency(total)}</span>
        </div>
    `;
}

// SUBMIT DO CHECKOUT
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.cartProduct) return;

    const btn = document.getElementById('btn-submit-order');
    btn.disabled = true;
    btn.innerText = "Processando Transação de Alta Escala...";

    const payload = {
        produto_id: state.cartProduct.id,
        nome_cliente: document.getElementById('client-name').value,
        email_cliente: document.getElementById('client-email').value,
        valor_pago: state.cartProduct.price + (state.cartProduct.price * 0.15)
    };

    let orderId = crypto.randomUUID(); // Fallback UUID

    try {
        // LAB 1 & 2: O checkout trava ou retorna erro dependendo da branch/falha ativada na API
        const res = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            orderId = data.id || orderId;
        } else {
            console.warn("API retornou erro ao registrar pedido. Seguindo no fluxo simulado.");
        }
    } catch (err) {
        console.warn("Erro ao comunicar com a API. Simulando criação de pedido local.", err);
    }

    // Navega para a página de confirmação
    window.location.hash = `#/pedido-confirmado?orderId=${orderId}&produto=${state.cartProduct.id}`;
});

// RENDER 4: Pedido Confirmado + Polling de fila RabbitMQ
async function renderOrderConfirmation(orderId, prodId) {
    const prod = await fetchProductById(prodId);

    document.getElementById('summary-order-id').innerText = orderId || "UUID-NÃO-GERADO";
    document.getElementById('summary-product-name').innerText = prod ? prod.name : "Produto Desconhecido";

    const value = prod ? prod.price * 1.15 : 0;
    document.getElementById('summary-total-price').innerText = formatCurrency(value);

    const statusBadge = document.getElementById('summary-order-status');
    statusBadge.className = 'order-status-badge status-pending';
    statusBadge.innerText = 'Aguardando Fila';

    // LAB 4: Simulação de processamento da Fila de Mensagens (RabbitMQ/Worker)
    // O frontend faz polling na API para verificar status. Se a API estiver offline ou simular falha:
    let attempts = 0;

    state.pollingIntervalId = setInterval(async () => {
        attempts++;
        console.log(`[Polling Fila] Verificando status do pedido ${orderId}... (tentativa ${attempts})`);

        try {
            const res = await fetch(`${API_BASE_URL}/pedidos/${orderId}`);
            if (res.ok) {
                const orderData = await res.json();
                if (orderData.status === 'confirmed') {
                    statusBadge.className = 'order-status-badge status-confirmed';
                    statusBadge.innerText = 'Confirmado';
                    clearInterval(state.pollingIntervalId);
                }
                return;
            }
        } catch (err) {
            // Se falhar a comunicação, após 3 tentativas simulamos o processamento ideal (exceto no lab de falha de worker)
            if (attempts >= 3) {
                statusBadge.className = 'order-status-badge status-confirmed';
                statusBadge.innerText = 'Confirmado (Simulado)';
                clearInterval(state.pollingIntervalId);
            }
        }
    }, 3000);
}

// ----------------------------------------
// EVENT LISTENERS DE FILTROS & BUSCA
// ----------------------------------------
document.getElementById('search-input').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (window.location.hash === '' || window.location.hash === '#') {
        renderVitrine();
    }
});

document.getElementById('sort-select').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    if (window.location.hash === '' || window.location.hash === '#') {
        renderVitrine();
    }
});

// Logo link
document.getElementById('logo-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#';
});

// Inicialização
window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
    router();
});
