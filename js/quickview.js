// ========================================
// SEUN — Product Quick View Modal
// ========================================

const QuickView = (() => {
    let modal = null;
    let modalOverlay = null;

    function init() {
        if (modal) return;
        createModalHTML();
        bindEvents();
    }

    function createModalHTML() {
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'quickview-overlay';
        modalOverlay.id = 'quickview-overlay';
        document.body.appendChild(modalOverlay);

        modal = document.createElement('div');
        modal.className = 'quickview-modal';
        modal.id = 'quickview-modal';
        modal.innerHTML = `
            <button class="quickview-close" id="quickview-close" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="quickview-content">
                <div class="quickview-image" id="quickview-image"></div>
                <div class="quickview-info" id="quickview-info"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    function bindEvents() {
        modalOverlay.addEventListener('click', close);
        document.getElementById('quickview-close').addEventListener('click', close);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) close();
        });
    }

    function open(productId) {
        const product = getProductById(productId);
        if (!product) return;

        const imageContainer = document.getElementById('quickview-image');
        const infoContainer = document.getElementById('quickview-info');

        imageContainer.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="eager">
            ${product.badge ? `<span class="quickview-badge">${product.badge}</span>` : ''}
        `;

        infoContainer.innerHTML = `
            <h2 class="quickview-name">${product.name}</h2>
            <p class="quickview-price">${formatPrice(product.price)}</p>
            <p class="quickview-size">${product.size}</p>
            <div class="quickview-divider"></div>
            <p class="quickview-description">${product.description}</p>
            <div class="quickview-actions">
                <div class="quickview-qty">
                    <button class="qty-btn qty-minus" id="qv-qty-minus" aria-label="Decrease">−</button>
                    <span class="qty-value" id="qv-qty-value">1</span>
                    <button class="qty-btn qty-plus" id="qv-qty-plus" aria-label="Increase">+</button>
                </div>
                <button class="quickview-add-btn" id="qv-add-btn">ADD TO BAG</button>
            </div>
        `;

        // Bind quantity controls
        let qty = 1;
        const qtyDisplay = document.getElementById('qv-qty-value');

        document.getElementById('qv-qty-minus').addEventListener('click', () => {
            if (qty > 1) {
                qty--;
                qtyDisplay.textContent = qty;
            }
        });

        document.getElementById('qv-qty-plus').addEventListener('click', () => {
            qty++;
            qtyDisplay.textContent = qty;
        });

        // Add to bag
        document.getElementById('qv-add-btn').addEventListener('click', () => {
            Cart.add(product.id, qty);
            Toast.show(`${product.name} added to bag`, 'success');
            close();
        });

        // Show modal
        modal.classList.add('open');
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        modal.classList.remove('open');
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    return { init, open, close };
})();
