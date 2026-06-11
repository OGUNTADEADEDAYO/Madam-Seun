// ========================================
// SEUN — Checkout Flow (WhatsApp)
// ========================================

const Checkout = (() => {
    const WHATSAPP_NUMBER = '2348104539052';
    let overlay = null;
    let currentStep = 1;

    function init() {
        if (overlay) return;
        createOverlayHTML();
    }

    function createOverlayHTML() {
        overlay = document.createElement('div');
        overlay.className = 'checkout-overlay';
        overlay.id = 'checkout-overlay';
        document.body.appendChild(overlay);
    }

    function open() {
        if (Cart.getCount() === 0) {
            Toast.show('Your bag is empty', 'error');
            return;
        }
        currentStep = 1;
        renderStep1();
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ── STEP 1: Order Review ──────────────────
    function renderStep1() {
        const items = Cart.getItems();
        const total = Cart.getTotal();

        overlay.innerHTML = `
            <div class="checkout-container">
                <div class="checkout-header">
                    <button class="checkout-back" onclick="Checkout.close()" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <h2 class="checkout-title">CHECKOUT</h2>
                    <div class="checkout-steps-indicator">
                        <span class="step-dot active"></span>
                        <span class="step-line"></span>
                        <span class="step-dot"></span>
                    </div>
                </div>

                <div class="checkout-body">
                    <h3 class="checkout-section-title">ORDER SUMMARY</h3>
                    <div class="checkout-items">
                        ${items.map(({ product, qty }) => `
                            <div class="checkout-item">
                                <div class="checkout-item-image">
                                    <img src="${product.image}" alt="${product.name}">
                                </div>
                                <div class="checkout-item-info">
                                    <p class="checkout-item-name">${product.name}</p>
                                    <p class="checkout-item-meta">${product.size} · Qty: ${qty}</p>
                                </div>
                                <p class="checkout-item-price">${formatPrice(product.price * qty)}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div class="checkout-totals">
                        <div class="checkout-total-row">
                            <span>Subtotal</span>
                            <span>${formatPrice(total)}</span>
                        </div>
                        <div class="checkout-total-row">
                            <span>Delivery</span>
                            <span class="checkout-delivery-note">Calculated after details</span>
                        </div>
                        <div class="checkout-total-row checkout-total-final">
                            <span>TOTAL</span>
                            <span>${formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                <div class="checkout-footer">
                    <button class="checkout-proceed-btn" id="checkout-proceed-btn">PROCEED TO DETAILS</button>
                </div>
            </div>
        `;

        document.getElementById('checkout-proceed-btn').addEventListener('click', () => {
            currentStep = 2;
            renderStep2();
        });
    }

    // ── STEP 2: Customer Details + WhatsApp ───
    function renderStep2() {
        const items = Cart.getItems();
        const total = Cart.getTotal();

        overlay.innerHTML = `
            <div class="checkout-container">
                <div class="checkout-header">
                    <button class="checkout-back" id="checkout-back-btn" aria-label="Back">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    </button>
                    <h2 class="checkout-title">YOUR DETAILS</h2>
                    <div class="checkout-steps-indicator">
                        <span class="step-dot completed">✓</span>
                        <span class="step-line active"></span>
                        <span class="step-dot active"></span>
                    </div>
                </div>

                <div class="checkout-body">
                    <form class="checkout-form" id="checkout-form" novalidate>
                        <div class="form-group">
                            <label for="checkout-name">Full Name *</label>
                            <input type="text" id="checkout-name" name="name" placeholder="Enter your full name" required>
                            <span class="form-error" id="error-name"></span>
                        </div>

                        <div class="form-group">
                            <label for="checkout-phone">Phone Number *</label>
                            <input type="tel" id="checkout-phone" name="phone" placeholder="e.g. 08012345678" required>
                            <span class="form-error" id="error-phone"></span>
                        </div>

                        <div class="form-group">
                            <label for="checkout-email">Email (optional)</label>
                            <input type="email" id="checkout-email" name="email" placeholder="your@email.com">
                        </div>

                        <div class="form-group">
                            <label for="checkout-address">Delivery Address *</label>
                            <textarea id="checkout-address" name="address" rows="3" placeholder="Enter your delivery address" required></textarea>
                            <span class="form-error" id="error-address"></span>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="checkout-city">City *</label>
                                <input type="text" id="checkout-city" name="city" placeholder="e.g. Lagos" required>
                                <span class="form-error" id="error-city"></span>
                            </div>
                            <div class="form-group">
                                <label for="checkout-state">State *</label>
                                <input type="text" id="checkout-state" name="state" placeholder="e.g. Lagos" required>
                                <span class="form-error" id="error-state"></span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="checkout-notes">Order Notes (optional)</label>
                            <textarea id="checkout-notes" name="notes" rows="2" placeholder="Any special instructions?"></textarea>
                        </div>
                    </form>
                </div>

                <div class="checkout-footer">
                    <button class="checkout-whatsapp-btn" id="checkout-whatsapp-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        ORDER VIA WHATSAPP
                    </button>
                </div>
            </div>
        `;

        // Back button
        document.getElementById('checkout-back-btn').addEventListener('click', () => {
            currentStep = 1;
            renderStep1();
        });

        // WhatsApp submit
        document.getElementById('checkout-whatsapp-btn').addEventListener('click', (e) => {
            e.preventDefault();
            if (validateForm()) {
                sendWhatsApp();
            }
        });
    }

    // ── Form Validation ───────────────────────
    function validateForm() {
        let isValid = true;

        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => el.classList.remove('invalid'));

        const fields = [
            { id: 'checkout-name', error: 'error-name', message: 'Please enter your full name' },
            { id: 'checkout-phone', error: 'error-phone', message: 'Please enter a valid phone number' },
            { id: 'checkout-address', error: 'error-address', message: 'Please enter your delivery address' },
            { id: 'checkout-city', error: 'error-city', message: 'Please enter your city' },
            { id: 'checkout-state', error: 'error-state', message: 'Please enter your state' },
        ];

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input || !input.value.trim()) {
                document.getElementById(field.error).textContent = field.message;
                if (input) input.classList.add('invalid');
                isValid = false;
            }
        });

        // Phone format check
        const phone = document.getElementById('checkout-phone');
        if (phone && phone.value.trim()) {
            const cleaned = phone.value.replace(/[\s\-\(\)]/g, '');
            if (cleaned.length < 10 || cleaned.length > 14) {
                document.getElementById('error-phone').textContent = 'Please enter a valid phone number';
                phone.classList.add('invalid');
                isValid = false;
            }
        }

        if (!isValid) {
            Toast.show('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    // ── Order Processing & WhatsApp Message Builder ──────────────
    async function sendWhatsApp() {
        const btn = document.getElementById('checkout-whatsapp-btn');
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = 'PROCESSING...';
        btn.disabled = true;

        const name = document.getElementById('checkout-name').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        const email = document.getElementById('checkout-email').value.trim();
        const address = document.getElementById('checkout-address').value.trim();
        const city = document.getElementById('checkout-city').value.trim();
        const state = document.getElementById('checkout-state').value.trim();
        const notes = document.getElementById('checkout-notes').value.trim();

        const items = Cart.getItems();
        const total = Cart.getTotal();

        // 1. Save to Database
        try {
            const trackId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            const orderPayload = {
                trackId,
                name,
                email,
                phone,
                city,
                address: address + (state ? `, ${state}` : ''),
                items: items.map(i => ({ name: i.product.name, qty: i.qty, price: i.product.price, size: i.product.size })),
                total,
                shippingFee: 'Pending',
                locCode: city.toLowerCase() === 'lagos' ? 'LOS' : 'OTHER'
            };

            await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
        } catch (err) {
            console.error('Failed to save order to database:', err);
            // We proceed to WhatsApp anyway as fallback
        }

        // 2. Build message
        let message = `🛍️ *NEW ORDER — SEUN PERFUMES*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        message += `*📋 ORDER ITEMS:*\n`;
        items.forEach(({ product, qty }, index) => {
            message += `${index + 1}. ${product.name} (${product.size})\n`;
            message += `   Qty: ${qty} × ${formatPrice(product.price)} = ${formatPrice(product.price * qty)}\n`;
        });

        message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        message += `*💰 SUBTOTAL: ${formatPrice(total)}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        message += `*👤 CUSTOMER DETAILS:*\n`;
        message += `Name: ${name}\n`;
        message += `Phone: ${phone}\n`;
        if (email) message += `Email: ${email}\n`;
        message += `\n*📍 DELIVERY ADDRESS:*\n`;
        message += `${address}\n`;
        message += `${city}, ${state}\n`;

        if (notes) {
            message += `\n*📝 NOTES:*\n${notes}\n`;
        }

        message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        message += `_Order placed via seunperfumes.com_`;

        // Encode and open WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        // Show confirmation and clear cart
        Toast.show('Order sent! Redirecting to WhatsApp...', 'success', 4000);
        Cart.clear();
        close();
        
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    }

    return { init, open, close };
})();
