// ========================================
// SEUN — Main JavaScript (v3)
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    // ── Initialize all modules ────────────────
    CartUI.init();
    QuickView.init();
    Checkout.init();

    // ── Auto-assign product IDs to cards ──────
    // Match cards to PRODUCTS by name + price text
    function assignProductIds() {
        document.querySelectorAll('.product-card').forEach(card => {
            if (card.getAttribute('data-product-id')) return; // Already assigned

            const nameEl = card.querySelector('.product-name');
            const priceEl = card.querySelector('.product-price');
            if (!nameEl || !priceEl) return;

            const name = nameEl.textContent.trim();
            const priceText = priceEl.textContent.trim();

            // Find matching product
            const match = PRODUCTS.find(p => {
                const formattedPrice = formatPrice(p.price);
                return p.name === name && formattedPrice === priceText;
            });

            if (match) {
                card.setAttribute('data-product-id', match.id);
            }
        });
    }

    assignProductIds();

    // ── Add to Cart from product cards ─────────
    function bindAddToCartButtons() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            // Avoid double-binding
            if (btn.hasAttribute('data-bound')) return;
            btn.setAttribute('data-bound', 'true');

            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't trigger card click (quickview)

                const card = btn.closest('.product-card');
                const productId = card ? card.getAttribute('data-product-id') : null;

                if (productId) {
                    Cart.add(productId);
                    const product = getProductById(productId);
                    if (product) {
                        Toast.show(`${product.name} added to bag`, 'success');
                    }
                }

                // Visual feedback on button
                const originalText = btn.textContent;
                btn.textContent = 'ADDED ✓';
                btn.style.background = '#1A1A1A';
                btn.style.color = '#FFFFFF';

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
                // Don't open quickview if clicking the add-to-cart button
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
                    assignProductIds();
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

});
