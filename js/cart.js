// ========================================
// SEUN — Cart State Engine (localStorage)
// ========================================

const Cart = (() => {
    const STORAGE_KEY = 'seun-cart';

    // Internal state: { productId: quantity }
    let items = {};

    // Load cart from localStorage
    function load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            items = saved ? JSON.parse(saved) : {};
        } catch (e) {
            items = {};
        }
    }

    // Save cart to localStorage and fire update event
    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('cart-updated'));
    }

    // Add item to cart (or increment quantity)
    function add(productId, qty = 1) {
        const product = getProductById(productId);
        if (!product) return false;

        if (items[productId]) {
            items[productId] += qty;
        } else {
            items[productId] = qty;
        }
        save();
        return true;
    }

    // Remove item entirely
    function remove(productId) {
        if (items[productId]) {
            delete items[productId];
            save();
            return true;
        }
        return false;
    }

    // Set specific quantity (0 removes the item)
    function updateQty(productId, qty) {
        if (qty <= 0) {
            return remove(productId);
        }
        items[productId] = qty;
        save();
        return true;
    }

    // Get all cart items as array of { product, qty }
    function getItems() {
        const result = [];
        for (const [id, qty] of Object.entries(items)) {
            const product = getProductById(id);
            if (product) {
                result.push({ product, qty });
            }
        }
        return result;
    }

    // Get subtotal
    function getTotal() {
        let total = 0;
        for (const [id, qty] of Object.entries(items)) {
            const product = getProductById(id);
            if (product) {
                total += product.price * qty;
            }
        }
        return total;
    }

    // Get total number of items
    function getCount() {
        let count = 0;
        for (const qty of Object.values(items)) {
            count += qty;
        }
        return count;
    }

    // Clear the entire cart
    function clear() {
        items = {};
        save();
    }

    // Initialize on load
    load();

    return {
        add,
        remove,
        updateQty,
        getItems,
        getTotal,
        getCount,
        clear
    };
})();
