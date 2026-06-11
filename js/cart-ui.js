// ========================================
// SEUN — Cart Drawer UI
// ========================================

const CartUI = (() => {
    let drawer = null;
    let overlay = null;
    let isOpen = false;

    function init() {
        if (drawer) return;
        createDrawerHTML();
        bindEvents();
        updateBadge();
    }

    function createDrawerHTML() {
        // Overlay
        overlay = document.createElement('div');
        overlay.className = 'cart-overlay';
        overlay.id = 'cart-overlay';
        document.body.appendChild(overlay);

        // Drawer
        drawer = document.createElement('div');
        drawer.className = 'cart-drawer';
        drawer.id = 'cart-drawer';
        drawer.innerHTML = `
            <div class="cart-drawer-header">
                <h2 class="cart-drawer-title">YOUR BAG</h2>
                <button class="cart-drawer-close" id="cart-drawer-close" aria-label="Close cart">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <div class="cart-drawer-body" id="cart-drawer-body">
                <!-- Items rendered dynamically -->
            </div>
            <div class="cart-drawer-footer" id="cart-drawer-footer">
                <!-- Footer rendered dynamically -->
            </div>
        `;
        document.body.appendChild(drawer);
    }

    function bindEvents() {
        // Close drawer
        overlay.addEventListener('click', close);
        document.getElementById('cart-drawer-close').addEventListener('click', close);

        // Open drawer on cart icon click
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', toggle);
        }

        // Listen for cart updates
        window.addEventListener('cart-updated', render);

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) close();
        });
    }

    function open() {
        isOpen = true;
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        render();
    }

    function close() {
        isOpen = false;
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    function toggle() {
        isOpen ? close() : open();
    }

    function render() {
        const items = Cart.getItems();
        const body = document.getElementById('cart-drawer-body');
        const footer = document.getElementById('cart-drawer-footer');

        if (items.length === 0) {
            body.innerHTML = `
                <div class="cart-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 01-8 0"></path>
                    </svg>
                    <p>Your bag is empty</p>
                    <button class="cart-continue-btn" onclick="CartUI.close()">CONTINUE SHOPPING</button>
                </div>
            `;
            footer.innerHTML = '';
        } else {
            body.innerHTML = items.map(({ product, qty }) => `
                <div class="cart-item" data-id="${product.id}">
                    <div class="cart-item-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="cart-item-details">
                        <p class="cart-item-name">${product.name}</p>
                        <p class="cart-item-size">${product.size}</p>
                        <p class="cart-item-price">${formatPrice(product.price)}</p>
                        <div class="cart-item-qty">
                            <button class="qty-btn qty-minus" data-id="${product.id}" aria-label="Decrease quantity">−</button>
                            <span class="qty-value">${qty}</span>
                            <button class="qty-btn qty-plus" data-id="${product.id}" aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-id="${product.id}" aria-label="Remove item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </div>
            `).join('');

            footer.innerHTML = `
                <div class="cart-subtotal">
                    <span>SUBTOTAL</span>
                    <span class="cart-subtotal-amount">${formatPrice(Cart.getTotal())}</span>
                </div>
                <button class="cart-checkout-btn" id="cart-checkout-btn">CHECKOUT</button>
                <button class="cart-continue-btn" onclick="CartUI.close()">CONTINUE SHOPPING</button>
            `;

            // Bind quantity and remove buttons
            body.querySelectorAll('.qty-minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const item = Cart.getItems().find(i => i.product.id === id);
                    if (item && item.qty > 1) {
                        Cart.updateQty(id, item.qty - 1);
                    } else {
                        Cart.remove(id);
                        Toast.show('Item removed from bag', 'info');
                    }
                });
            });

            body.querySelectorAll('.qty-plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const item = Cart.getItems().find(i => i.product.id === id);
                    if (item) {
                        Cart.updateQty(id, item.qty + 1);
                    }
                });
            });

            body.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    Cart.remove(id);
                    Toast.show('Item removed from bag', 'info');
                });
            });

            // Checkout button
            const checkoutBtn = document.getElementById('cart-checkout-btn');
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', () => {
                    close();
                    if (typeof Checkout !== 'undefined') {
                        Checkout.open();
                    }
                });
            }
        }

        updateBadge();
    }

    function updateBadge() {
        const count = Cart.getCount();
        let badge = document.getElementById('cart-badge');

        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.id = 'cart-badge';
                const cartBtn = document.getElementById('cart-btn');
                if (cartBtn) cartBtn.appendChild(badge);
            }
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }

    return { init, open, close, toggle, render };
})();
