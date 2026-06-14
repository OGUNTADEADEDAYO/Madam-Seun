// ========================================
// SEUN — Main JavaScript (v3)
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // Load products from API if available
    if (typeof loadProducts === 'function') {
        await loadProducts();
    }
    // ── Initialize all modules ────────────────
    CartUI.init();
    QuickView.init();
    Checkout.init();

    // ── Dynamic Rendering of Products ──────────
    function renderProductCards(containerSelector, products) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No products found.</p>';
            return;
        }

        container.innerHTML = products.map(p => `
            <div class="product-card" data-product-id="${p.id}">
                <div class="product-image">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='placeholder.webp'">
                    ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
                </div>
                <div class="product-info">
                    <p class="product-name">${p.name}</p>
                    <p class="product-price">${formatPrice(p.price)}</p>
                </div>
                <button class="add-to-cart-btn">ADD TO CART</button>
            </div>
        `).join('');
    }

    function renderAllProducts() {
        // Best Sellers section
        const bestSellers = PRODUCTS.filter(p => p.categories.includes('best-sellers')).slice(0, 4);
        renderProductCards('#best-sellers .products-grid', bestSellers);

        // New Arrivals section (top)
        const newArrivals = PRODUCTS.filter(p => p.categories.includes('new-arrivals')).slice(0, 4);
        renderProductCards('#new-arrivals .products-grid', newArrivals);

        // Category Tabs
        const tabs = [
            { id: 'panel-all', cat: 'all' },
            { id: 'panel-men', cat: 'men' },
            { id: 'panel-unisex', cat: 'unisex' },
            { id: 'panel-new-arrivals', cat: 'new-arrivals-tab' },
            { id: 'panel-gift-sets', cat: 'gift-sets' },
            { id: 'panel-brands', cat: 'brands' },
            { id: 'panel-women', cat: 'women' }
        ];

        tabs.forEach(tab => {
            // For 'all' we can just show all products, or slice to a reasonable number
            const prods = tab.cat === 'all' 
                ? PRODUCTS 
                : PRODUCTS.filter(p => p.categories.includes(tab.cat));
            renderProductCards(`#${tab.id} .products-grid`, prods);
        });
    }

    renderAllProducts();

    // ── Add to Cart from product cards ─────────
    function bindAddToCartButtons() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            if (btn.hasAttribute('data-bound')) return;
            btn.setAttribute('data-bound', 'true');

            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                const card = btn.closest('.product-card');
                const productId = card ? card.getAttribute('data-product-id') : null;

                if (productId) {
                    Cart.add(productId);
                    const product = getProductById(productId);
                    if (product) {
                        Toast.show(`${product.name} added to bag`, 'success');
                    }
                }

                const originalText = btn.textContent;
                btn.textContent = 'ADDED ✓';
                btn.style.background = '#c9b48e';
                btn.style.color = '#1A1A1A';

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 1500);
            });
        });
    }

    bindAddToCartButtons();

    // ── Quick View on card click ───────────────
    function bindQuickView() {
        document.querySelectorAll('.product-card').forEach(card => {
            if (card.hasAttribute('data-qv-bound')) return;
            card.setAttribute('data-qv-bound', 'true');

            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return;

                const productId = card.getAttribute('data-product-id');
                if (productId) {
                    QuickView.open(productId);
                }
            });
        });
    }

    bindQuickView();

    // ── Search functionality ──────────────────
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            // Only search in the active tab panel + top sections
            const activePanels = document.querySelectorAll(
                '#best-sellers .product-card, #new-arrivals .product-card, .category-tab-panel.active .product-card'
            );

            activePanels.forEach(card => {
                const name = card.querySelector('.product-name');
                if (!name) return;

                const nameText = name.textContent.toLowerCase();
                if (query === '' || nameText.includes(query)) {
                    card.style.display = '';
                    card.style.opacity = '1';
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => {
                        if (card.style.opacity === '0') {
                            card.style.display = 'none';
                        }
                    }, 200);
                }
            });
        });
    }

    // ── Scroll reveal animation ───────────────
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    function observeVisibleCards() {
        // Only observe cards that are currently in visible sections
        const visibleCards = document.querySelectorAll(
            '#best-sellers .product-card, #new-arrivals .product-card, .category-tab-panel.active .product-card'
        );

        visibleCards.forEach((card, index) => {
            if (card.getAttribute('data-revealed') === 'true') return;
            card.setAttribute('data-revealed', 'true');

            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            const delay = (index % 4) * 0.08;
            card.style.transition = `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`;
            observer.observe(card);
        });
    }

    observeVisibleCards();

    // ── Video Intersection Observer ────────────
    const videoElement = document.getElementById('hero-video');
    if (videoElement) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const playPromise = videoElement.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("Video autoplay prevented:", error);
                        });
                    }
                } else {
                    videoElement.pause();
                }
            });
        }, { threshold: 0.3 });
        videoObserver.observe(videoElement);
    }

    // ── Category Tab Switching ─────────────────
    const categoryLinks = document.querySelectorAll('.category-link');
    const tabPanels = document.querySelectorAll('.category-tab-panel');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Toggle active states
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Hide all panels
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Show targeted panel
            const targetId = link.getAttribute('data-target');
            if (targetId) {
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');

                    // Re-observe cards for scroll reveal in the new panel
                    observeVisibleCards();

                    // Re-bind any new cards
                    bindAddToCartButtons();
                    bindQuickView();
                }
            }
        });
    });

    // ── Mobile Menu Toggle ────────────────────
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
        });

        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
            });
        });

        // Close menu on scroll
        window.addEventListener('scroll', () => {
            if (mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
            }
        });
    }

    // ── Newsletter Subscription ────────────────
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input[type="email"]');
            const btn = newsletterForm.querySelector('button');
            const originalBtnText = btn.innerHTML;
            
            if (!input || !input.value) return;

            btn.innerHTML = '...';
            btn.disabled = true;

            try {
                const res = await fetch('http://localhost:5000/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: input.value })
                });
                
                if (res.ok) {
                    Toast.show('Subscribed successfully!', 'success');
                    input.value = '';
                } else {
                    const data = await res.json();
                    Toast.show(data.message || data.error || 'Failed to subscribe', 'error');
                }
            } catch (err) {
                console.error(err);
                Toast.show('Network error', 'error');
            } finally {
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
            }
        });
    }

});
