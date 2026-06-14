// ========================================
// SEUN — Product Data Catalog
// ========================================

// PRODUCTS will be initialized after FALLBACK_PRODUCTS

const FALLBACK_PRODUCTS = [

    // ── BEST SELLERS ──────────────────────────
    {
        id: 'jm-perfume-1',
        name: 'Jo Malone Perfume',
        price: 24500,
        image: 'jo malone perfume 1.webp',
        size: '100ml',
        categories: ['best-sellers', 'women', 'brands', 'all'],
        badge: 'Best Seller',
        description: 'A timeless English fragrance that blends light florals with a warm amber base. Jo Malone Perfume captures elegance in every note — perfect for day-to-night wear.'
    },
    {
        id: 'prada-milano-1',
        name: 'Prada Milano',
        price: 28000,
        image: 'Prada milano 3 1.webp',
        size: '100ml',
        categories: ['best-sellers', 'men', 'brands', 'all'],
        badge: 'Best Seller',
        description: 'Sophisticated and bold, Prada Milano is an aromatic woody scent inspired by the Italian fashion capital. Rich notes of amber, cedar, and vetiver create an unforgettable trail.'
    },
    {
        id: 'zara-perfume-1',
        name: 'Zara Perfume',
        price: 15500,
        image: 'zara perfume 2 1.webp',
        size: '75ml',
        categories: ['best-sellers', 'unisex', 'brands', 'all'],
        badge: 'Best Seller',
        description: 'A fresh and vibrant everyday fragrance from Zara. Clean citrus top notes melt into a soft musk base, making it the perfect signature scent for any occasion.'
    },
    {
        id: 'jm-intense-1',
        name: 'Jo Malone Intense',
        price: 30000,
        image: 'jo malone perfume 1.webp',
        size: '50ml',
        categories: ['best-sellers', 'women', 'all'],
        badge: 'Best Seller',
        description: 'The Intense collection elevates Jo Malone\'s artistry with deeper, longer-lasting concentrations. Dark amber, rich oud, and smoky vetiver create a luxurious evening fragrance.'
    },

    // ── NEW ARRIVALS (Top Section) ────────────
    {
        id: 'jm-2',
        name: 'Jo Malone',
        price: 18000,
        image: 'jo malone 2 1.webp',
        size: '50ml',
        categories: ['new-arrivals', 'unisex', 'all'],
        badge: 'New',
        description: 'A lighter interpretation of the classic Jo Malone line. Peony and blush suede come together in this delicate, skin-like fragrance that whispers rather than shouts.'
    },
    {
        id: 'prada-milano-2',
        name: 'Prada Milano',
        price: 26000,
        image: 'prada milano 3.webp',
        size: '75ml',
        categories: ['new-arrivals', 'women', 'all'],
        badge: 'New',
        description: 'The latest from Prada\'s Milano line brings a modern feminine twist. Iris, mandarin, and vanilla create a warm yet sophisticated aura that lingers beautifully.'
    },
    {
        id: 'zara-perfume-2',
        name: 'Zara Perfume',
        price: 12500,
        image: 'zara perfume 3 1.webp',
        size: '50ml',
        categories: ['new-arrivals', 'unisex', 'all'],
        badge: 'New',
        description: 'Zara\'s newest addition features a blend of white tea and jasmine. Light, airy, and effortlessly cool — designed for the modern minimalist.'
    },
    {
        id: 'prada-special',
        name: 'Prada Milano Special',
        price: 35000,
        image: 'prada milano 3.webp',
        size: '100ml',
        categories: ['new-arrivals', 'men', 'all'],
        badge: 'New',
        description: 'A limited special edition from Prada Milano. Leather, saffron, and dark tonka bean create an intoxicating blend reserved for those who demand the extraordinary.'
    },

    // ── MEN ───────────────────────────────────
    {
        id: 'prada-men-1',
        name: 'Prada Milano',
        price: 21500,
        image: 'Prada milano 3 1.webp',
        size: '75ml',
        categories: ['men', 'brands', 'all'],
        description: 'Crafted for the modern gentleman, this Prada scent balances sharp bergamot with smooth sandalwood. Clean, confident, and endlessly wearable.'
    },
    {
        id: 'jm-men-1',
        name: 'Jo Malone',
        price: 19000,
        image: 'jo malone 3 1.webp',
        size: '50ml',
        categories: ['men', 'brands', 'all'],
        description: 'Jo Malone\'s take on masculine elegance. Wood sage and sea salt evoke windswept coastlines and untamed nature — fresh, mineral, and utterly addictive.'
    },
    {
        id: 'zara-men-1',
        name: 'Zara Perfume',
        price: 14000,
        image: 'zara perfume 2 1.webp',
        size: '75ml',
        categories: ['men', 'brands', 'all'],
        description: 'A bold and dynamic scent from Zara\'s men\'s line. Spicy cardamom and cedarwood over a warm amber base — perfect for making a statement.'
    },
    {
        id: 'jm-classic',
        name: 'Jo Malone Classic',
        price: 22000,
        image: 'jo malone 3 1.webp',
        size: '100ml',
        categories: ['men', 'all'],
        description: 'The original classic that started it all. Lime, basil, and mandarin create a clean, crisp profile that has been a gentlemen\'s favourite for decades.'
    },

    // ── UNISEX ────────────────────────────────
    {
        id: 'zara-unisex',
        name: 'Zara Unisex',
        price: 18000,
        image: 'zara perfume 3 1.webp',
        size: '75ml',
        categories: ['unisex', 'all'],
        description: 'Designed for everyone, this Zara fragrance breaks boundaries with a gender-fluid blend of fig, cedar, and white musk. Modern scenting at its finest.'
    },
    {
        id: 'jm-neutral',
        name: 'Jo Malone Neutral',
        price: 30000,
        image: 'jo malone perfume 1.webp',
        size: '100ml',
        categories: ['unisex', 'all'],
        description: 'A perfectly balanced unisex creation. English pear and freesia dance with patchouli and amber to create a scent that feels personal on every skin.'
    },
    {
        id: 'prada-unisex',
        name: 'Prada Unisex',
        price: 22500,
        image: 'Prada milano 3 1.webp',
        size: '50ml',
        categories: ['unisex', 'all'],
        description: 'Prada\'s foray into genderless fragrance. Neroli, musk, and ambrette seed create a clean, skin-close scent that adapts to the wearer.'
    },
    {
        id: 'zara-special',
        name: 'Zara Special',
        price: 15000,
        image: 'zara perfume 2 1.webp',
        size: '50ml',
        categories: ['unisex', 'all'],
        description: 'A special limited blend from Zara featuring rare ylang-ylang and tonka bean. Soft, warm, and unexpectedly complex for its price point.'
    },

    // ── NEW ARRIVALS (Tab) ────────────────────
    {
        id: 'prada-latest',
        name: 'Prada Latest',
        price: 28000,
        image: 'prada milano 3.webp',
        size: '75ml',
        categories: ['new-arrivals-tab', 'all'],
        badge: 'New',
        description: 'Fresh off the Prada runway, this latest release features a daring combination of pink pepper, suede, and benzoin. Contemporary luxury in a bottle.'
    },
    {
        id: 'jm-new',
        name: 'Jo Malone New',
        price: 25000,
        image: 'jo malone 3 1.webp',
        size: '50ml',
        categories: ['new-arrivals-tab', 'all'],
        badge: 'New',
        description: 'The newest addition to the Jo Malone family. Myrrh, tonka, and vanilla absolute create a resinous warmth that\'s both comforting and luxurious.'
    },
    {
        id: 'zara-fresh',
        name: 'Zara Fresh',
        price: 19000,
        image: 'zara perfume 3 1.webp',
        size: '100ml',
        categories: ['new-arrivals-tab', 'all'],
        badge: 'New',
        description: 'Zara Fresh lives up to its name — aquatic notes, green apple, and white cedar create a burst of clean energy. Perfect for hot Lagos days.'
    },
    {
        id: 'jm-edition',
        name: 'Jo Malone Edition',
        price: 32000,
        image: 'jo malone perfume 1.webp',
        size: '75ml',
        categories: ['new-arrivals-tab', 'all'],
        badge: 'Limited',
        description: 'A collector\'s limited edition. Oud and bergamot meet rare Damascus rose in this exquisite blend that pushes the boundaries of British perfumery.'
    },

    // ── GIFT SETS ─────────────────────────────
    {
        id: 'jm-gift-set',
        name: 'Jo Malone Gift Set',
        price: 45000,
        image: 'jo malone perfume 1.webp',
        size: '3 × 30ml',
        categories: ['gift-sets', 'all'],
        badge: 'Gift Set',
        description: 'The ultimate gifting experience. Three bestselling Jo Malone scents beautifully boxed — Peony & Blush Suede, Wood Sage, and English Pear. Perfect for someone special.'
    },
    {
        id: 'prada-gift-set',
        name: 'Prada Gift Set',
        price: 40000,
        image: 'Prada milano 3 1.webp',
        size: '2 × 50ml',
        categories: ['gift-sets', 'all'],
        badge: 'Gift Set',
        description: 'Two of Prada\'s finest fragrances in an elegant gift box. Milano Pour Homme and Milano Intense — luxury that speaks volumes.'
    },
    {
        id: 'zara-gift-set',
        name: 'Zara Gift Set',
        price: 30000,
        image: 'zara perfume 2 1.webp',
        size: '3 × 50ml',
        categories: ['gift-sets', 'all'],
        badge: 'Gift Set',
        description: 'Three of Zara\'s most popular fragrances in one premium box. A discovery set perfect for exploring new scents or gifting a loved one.'
    },
    {
        id: 'prada-exclusive',
        name: 'Prada Exclusive',
        price: 50000,
        image: 'prada milano 3.webp',
        size: '100ml',
        categories: ['gift-sets', 'brands', 'all'],
        badge: 'Exclusive',
        description: 'The crown jewel of the Prada collection. This exclusive formulation features aged oud, real gold flakes, and Italian iris. For the true connoisseur only.'
    },

    // ── BRANDS ────────────────────────────────
    {
        id: 'zara-collection',
        name: 'Zara Collection',
        price: 20000,
        image: 'zara perfume 3 1.webp',
        size: '75ml',
        categories: ['brands', 'all'],
        description: 'Part of Zara\'s premium Collection line. Oud, rose, and saffron blend seamlessly in this surprisingly luxurious offering at an accessible price point.'
    },
    {
        id: 'jm-series',
        name: 'Jo Malone Series',
        price: 26000,
        image: 'jo malone 3 1.webp',
        size: '100ml',
        categories: ['brands', 'all'],
        description: 'From Jo Malone\'s signature Series. Each bottle tells a story — this one speaks of rain-drenched gardens and wild blackberries on a summer afternoon.'
    },
    {
        id: 'prada-essentials',
        name: 'Prada Essentials',
        price: 24000,
        image: 'Prada milano 3 1.webp',
        size: '50ml',
        categories: ['brands', 'all'],
        description: 'Prada distilled to its essence. Clean iris, white cedar, and sheer musk — nothing more, nothing less. Italian minimalism perfected.'
    },
    {
        id: 'jm-premium',
        name: 'Jo Malone Premium',
        price: 35000,
        image: 'jo malone perfume 1.webp',
        size: '100ml',
        categories: ['brands', 'all'],
        badge: 'Premium',
        description: 'The Premium range showcases Jo Malone at its most indulgent. Velvet rose and oud intertwine with dark musks for an impossibly rich, long-lasting fragrance.'
    },

    // ── WOMEN ─────────────────────────────────
    {
        id: 'prada-femme',
        name: 'Prada Pour Femme',
        price: 25000,
        image: 'Prada milano 3 1.webp',
        size: '75ml',
        categories: ['women', 'all'],
        description: 'Prada\'s ode to femininity. Orange blossom, tuberose, and vanilla orchid create a sensual bouquet that\'s both powerful and graceful.'
    },
    {
        id: 'jm-flora',
        name: 'Jo Malone Flora',
        price: 22000,
        image: 'jo malone 3 1.webp',
        size: '50ml',
        categories: ['women', 'all'],
        description: 'A celebration of English gardens in bloom. Wild bluebell, lily of the valley, and jasmine create a romantic, dewy freshness that lasts all day.'
    },
    {
        id: 'zara-bloom',
        name: 'Zara Bloom',
        price: 16000,
        image: 'zara perfume 2 1.webp',
        size: '75ml',
        categories: ['women', 'all'],
        description: 'Zara Bloom captures the essence of spring. Peony, pink pepper, and cashmere wood create a soft, floral aura that\'s both youthful and sophisticated.'
    },
    {
        id: 'prada-rose',
        name: 'Prada Milano Rose',
        price: 28000,
        image: 'prada milano 3.webp',
        size: '50ml',
        categories: ['women', 'all'],
        description: 'A modern take on the classic rose fragrance. Bulgarian rose, amber, and patchouli create a rich, complex scent that redefines feminine luxury.'
    }
];

let PRODUCTS = FALLBACK_PRODUCTS;

// Helper: Find product by ID
function getProductById(id) {
    return PRODUCTS.find(p => p.id === id) || null;
}

// Helper: Get products by category
function getProductsByCategory(category) {
    if (category === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.categories.includes(category));
}

// Helper: Format price in Naira
function formatPrice(amount) {
    return '₦' + amount.toLocaleString('en-NG');
}

// Fetch products from backend
async function loadProducts() {
    try {
        const res = await fetch('http://localhost:5000/api/products?limit=100');
        if (!res.ok) return;
        const data = await res.json();
        if (data.products && data.products.length > 0) {
            PRODUCTS = data.products.map(p => ({
                id: p.sku || p._id,
                name: p.name,
                price: p.price,
                image: p.images && p.images[0] 
                    ? (p.images[0].url.startsWith('/uploads') ? 'http://localhost:5000' + p.images[0].url : p.images[0].url.replace(/^\//, '')) 
                    : 'placeholder.webp',
                size: p.size,
                categories: p.tags || [],
                badge: p.badge,
                description: p.description
            }));
        }
    } catch (err) {
        console.error('Failed to load products from API:', err);
    }
}
