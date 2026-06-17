// ═══════════════════════════════════════════════════
//  MADAM SEUN ADMIN — main.js
//  Full dashboard logic: auth, products, categories, analytics
// ═══════════════════════════════════════════════════

// ── CONFIG ─────────────────────────────────────────
// Change this to your deployed backend URL
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : 'https://madam-seun-api.onrender.com/api'; // Update when deployed

// ── STATE ───────────────────────────────────────────
let authToken = localStorage.getItem('ag_admin_token') || null;
let currentPage = 1;
let searchTimer = null;
let stockTargetId = null;
let categories = [];
let productImages = [];

// ── IN-MEMORY CACHE (stale-while-revalidate) ────────
// Shows cached data instantly on navigation, then re-fetches in background.
const _cache = {};
const CACHE_TTL = 60000; // 60s background refresh window

function cacheSet(key, data) {
    _cache[key] = { data, ts: Date.now() };
}
function cacheGet(key) {
    return _cache[key] ? _cache[key].data : null;
}
function cacheIsStale(key) {
    const e = _cache[key];
    return !e || (Date.now() - e.ts) > CACHE_TTL;
}

// ── INIT ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
    } else {
        document.getElementById('loginScreen').classList.remove('hidden');
    }

    // Enter key on login
    document.getElementById('loginPassword').addEventListener('keyup', e => {
        if (e.key === 'Enter') login();
    });
});

// ═══════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════
async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    const errEl = document.getElementById('loginError');
    errEl.classList.add('hidden');

    if (!username || !password) {
        errEl.textContent = 'Please enter username and password.';
        errEl.classList.remove('hidden');
        return;
    }

    btn.innerHTML = '<span class="spinner"></span> Signing in...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Login failed');

        authToken = data.token;
        localStorage.setItem('ag_admin_token', authToken);
        localStorage.setItem('ag_admin_user', JSON.stringify(data.admin));

        document.getElementById('adminName').textContent = data.admin.username;
        document.getElementById('adminAvatar').textContent = data.admin.username[0].toUpperCase();
        document.getElementById('adminRole').textContent = data.admin.role;

        showDashboard();
    } catch (err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
    } finally {
        btn.innerHTML = '<span>Sign In</span>';
        btn.disabled = false;
    }
}

function logout() {
    authToken = null;
    localStorage.removeItem('ag_admin_token');
    localStorage.removeItem('ag_admin_user');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
}

function showDashboard() {
    const user = JSON.parse(localStorage.getItem('ag_admin_user') || '{}');
    if (user.username) {
        document.getElementById('adminName').textContent = user.username;
        document.getElementById('adminAvatar').textContent = user.username[0].toUpperCase();
        document.getElementById('adminRole').textContent = user.role || 'admin';
    }

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    navigateTo('overview');
    loadCategories();
}

// ── API HELPER ──────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken ? `Bearer ${authToken}` : '',
            ...(options.headers || {})
        }
    });

    if (res.status === 401) {
        logout();
        throw new Error('Session expired.');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// ═══════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    const navEl = document.querySelector(`[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');

    const titles = {
        overview: 'Overview',
        products: 'Products',
        addProduct: 'Add Product',
        categories: 'Categories',
        orders: 'Orders',
        analytics: 'Analytics'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    // Load data for the page
    if (page === 'overview') loadOverview();
    if (page === 'products') { currentPage = 1; loadProducts(); }
    if (page === 'addProduct') initAddProduct();
    if (page === 'categories') loadCategories(true);
    if (page === 'orders') loadOrders();
    if (page === 'analytics') loadAnalytics();

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ═══════════════════════════════════════════════════
//  OVERVIEW
// ═══════════════════════════════════════════════════
function renderOverviewData(data, analyticsData) {
    document.getElementById('statTotal').textContent = data.total;
    document.getElementById('statInStock').textContent = data.inStock;
    document.getElementById('statPreOrder').textContent = data.preOrder || 0;
    document.getElementById('statSoldOut').textContent = data.soldOut;
    document.getElementById('statLowStock').textContent = data.lowStock;
    if (data.lowStock > 0) {
        document.getElementById('lowStockBadge').style.display = 'flex';
        document.getElementById('lowStockCount').textContent = data.lowStock;
    }
    renderMiniList('topViewedList', data.topViewed, p => `
      <div class="mini-item">
        <img class="mini-img" src="${getThumb(p)}" alt="" onerror="this.style.opacity=0">
        <div class="mini-name">${esc(p.name)}</div>
        <div class="mini-meta">${p.views} views</div>
      </div>
    `);
    if (analyticsData) {
        renderMiniList('lowStockList', analyticsData.lowStock, p => `
          <div class="mini-item">
            <img class="mini-img" src="${getThumb(p)}" alt="" onerror="this.style.opacity=0">
            <div class="mini-name">${esc(p.name)}</div>
            <div class="mini-meta"><span class="mini-badge badge-amber">${p.stock} left</span></div>
          </div>
        `, 'No low stock alerts 🎉');
    }
}

async function loadOverview() {
    // Show cached data instantly if available
    const cached = cacheGet('overview');
    if (cached) {
        renderOverviewData(cached.stats, cached.analytics);
    }
    // Re-fetch in background (always, or when stale)
    if (!cached || cacheIsStale('overview')) {
        try {
            const [stats, analytics] = await Promise.all([
                apiFetch('/products/stats'),
                apiFetch('/analytics/overview')
            ]);
            cacheSet('overview', { stats, analytics });
            renderOverviewData(stats, analytics);
        } catch (err) {
            if (!cached) showToast(err.message, 'error');
        }
    }
}

function renderMiniList(containerId, items, template, emptyMsg = 'No data yet.') {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!items || items.length === 0) {
        el.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--text3);font-size:0.8rem">${emptyMsg}</div>`;
        return;
    }
    el.innerHTML = items.map(template).join('');
}

// ═══════════════════════════════════════════════════
//  PRODUCTS LIST
// ═══════════════════════════════════════════════════
async function loadProducts() {
    const search = document.getElementById('productSearch').value.trim();
    const status = document.getElementById('filterStatus').value;
    const category = document.getElementById('filterCategory').value;

    const params = new URLSearchParams({
        adminView: 'true',
        page: currentPage,
        limit: 12,
        sort: 'createdAt',
        order: 'desc'
    });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (category) params.set('category', category);

    const cacheKey = 'products_' + params.toString();
    const tbody = document.getElementById('productsTableBody');

    // Show cached data instantly if available
    const cached = cacheGet(cacheKey);
    if (cached) {
        renderProductsTable(cached.products);
        renderPagination(cached.pagination);
    } else {
        tbody.innerHTML = `<tr><td colspan="6" class="table-loading"><span class="spinner"></span></td></tr>`;
    }

    // Re-fetch in background when stale or no cache
    if (!cached || cacheIsStale(cacheKey)) {
        try {
            const data = await apiFetch(`/products?${params}`);
            cacheSet(cacheKey, data);
            renderProductsTable(data.products);
            renderPagination(data.pagination);
        } catch (err) {
            if (!cached) tbody.innerHTML = `<tr><td colspan="6" class="table-loading" style="color:var(--red)">${err.message}</td></tr>`;
        }
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!products.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="table-loading">No products found.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => {
        const stockClass = p.stock === 0 ? 'stock-zero' : p.isLowStock ? 'stock-low' : 'stock-ok';
        const statusBadge = statusTag(p.status);
        return `
      <tr>
        <td>
          <div class="product-cell">
            <img class="product-thumb" src="${getThumb(p)}" alt="" onerror="this.style.opacity=0.3">
            <div>
              <div class="product-name">${esc(p.name)}</div>
              ${p.sku ? `<div class="product-sku">${esc(p.sku)}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="color:var(--text2);font-size:0.8rem">
          ${p.category ? `${p.category.icon || ''} ${esc(p.category.name)}` : '—'}
        </td>
        <td class="price-cell">₦${p.price.toLocaleString()}</td>
        <td>
          <div class="stock-cell">
            <span class="stock-num ${stockClass}">${p.stock}</span>
            ${p.isLowStock ? `<span class="mini-badge badge-amber">low</span>` : ''}
          </div>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-btns">
            <button class="btn-sm btn-edit btn-ghost" onclick="editProduct('${p._id}')">Edit</button>
            <button class="btn-sm btn-stock btn-ghost" onclick="openStockModal('${p._id}','${esc(p.name)}')">Stock</button>
            <button class="btn-sm btn-danger-sm btn-ghost" onclick="confirmDelete('${p._id}','${esc(p.name)}')">Del</button>
          </div>
        </td>
      </tr>
    `;
    }).join('');
}

function statusTag(status) {
    const map = {
        in_stock: '<span class="mini-badge badge-green">In Stock</span>',
        pre_order: '<span class="mini-badge badge-amber">Pre-order</span>',
        sold_out: '<span class="mini-badge badge-red">Sold Out</span>',
        hidden: '<span class="mini-badge badge-gray">Hidden</span>'
    };
    return map[status] || status;
}

function renderPagination({ page, pages }) {
    const el = document.getElementById('pagination');
    if (pages <= 1) { el.innerHTML = ''; return; }

    let html = '';
    if (page > 1) html += `<button class="btn-ghost btn-sm" onclick="goPage(${page - 1})">← Prev</button>`;
    html += `<span style="font-size:0.78rem;color:var(--text3);padding:0 0.5rem">Page ${page} of ${pages}</span>`;
    if (page < pages) html += `<button class="btn-ghost btn-sm" onclick="goPage(${page + 1})">Next →</button>`;
    el.innerHTML = html;
}

function goPage(p) { currentPage = p; loadProducts(); }

function debounceSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { currentPage = 1; loadProducts(); }, 400);
}

// ═══════════════════════════════════════════════════
//  ADD / EDIT PRODUCT
// ═══════════════════════════════════════════════════
async function initAddProduct() {
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('editProductId').value = '';
    document.getElementById('saveProductBtn').textContent = 'Save Product';
    // Ensure categories are loaded before resetting the form
    if (categories.length === 0) await loadCategories();
    resetForm();
    populateCategoryDropdown('pCategory');
}

function resetForm() {
    ['pName', 'pSku', 'pPrice', 'pComparePrice', 'pStock', 'pTags', 'pDescription', 'pTiktok'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('pLowStock').value = '5';
    document.getElementById('pStatus').value = 'in_stock';
    document.getElementById('pFeatured').checked = false;
    document.getElementById('editProductId').value = '';
    productImages = [];
    renderImageList();
    // Reset custom category input
    const customWrap = document.getElementById('customCategoryWrap');
    const customInput = document.getElementById('customCategoryInput');
    if (customWrap) customWrap.style.display = 'none';
    if (customInput) customInput.value = '';
    if (document.querySelector('.nav-item[data-page="products"]').classList.contains('active')) {
        navigateTo('products');
    }
}

async function editProduct(id) {
    navigateTo('addProduct');
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('editProductId').value = id;
    document.getElementById('saveProductBtn').textContent = 'Update Product';

    try {
        // Fetch product AND ensure categories are loaded before setting the dropdown
        const [{ product }] = await Promise.all([
            apiFetch(`/products/${id}`),
            categories.length === 0 ? loadCategories() : Promise.resolve()
        ]);

        document.getElementById('pName').value = product.name || '';
        document.getElementById('pSku').value = product.sku || '';
        document.getElementById('pPrice').value = product.price || '';
        document.getElementById('pComparePrice').value = product.compareAtPrice || '';
        document.getElementById('pDescription').value = product.description || '';
        document.getElementById('pStock').value = product.stock ?? '';
        document.getElementById('pLowStock').value = product.lowStockThreshold || 5;
        document.getElementById('pStatus').value = product.status || 'in_stock';
        document.getElementById('pFeatured').checked = product.featured || false;
        document.getElementById('pTags').value = (product.tags || []).join(', ');
        document.getElementById('pTiktok').value = product.tiktok || '';

        // Set category AFTER dropdown is guaranteed to be populated
        if (product.category) {
            const catId = product.category._id || product.category;
            const sel = document.getElementById('pCategory');
            if (!sel.querySelector(`option[value="${catId}"]`)) {
                populateCategoryDropdown('pCategory');
            }
            sel.value = catId;
            // If it's a custom "Other" category, show the custom input and restore the name
            const customWrap = document.getElementById('customCategoryWrap');
            const customInput = document.getElementById('customCategoryInput');
            if (catId === 'other' && customWrap) {
                customWrap.style.display = 'block';
                if (customInput && product.customCategory) {
                    customInput.value = product.customCategory;
                }
            }
        }

        productImages = product.images || [];
        renderImageList();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function saveProduct() {
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('pName').value.trim();
    const price = parseFloat(document.getElementById('pPrice').value);
    const stock = parseInt(document.getElementById('pStock').value);
    const category = document.getElementById('pCategory').value;
    const description = document.getElementById('pDescription').value.trim();

    if (!name || isNaN(price) || isNaN(stock) || !category || !description) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    // Handle "Other" custom category
    let finalCategory = category;
    let customCategoryName = '';
    if (category === 'other') {
        const customInput = document.getElementById('customCategoryInput');
        customCategoryName = customInput ? customInput.value.trim() : '';
        if (!customCategoryName) {
            showToast('Please type a category name for "Other".', 'error');
            return;
        }
        finalCategory = 'other';
    }

    const body = {
        name,
        sku: document.getElementById('pSku').value.trim() || undefined,
        price,
        compareAtPrice: parseFloat(document.getElementById('pComparePrice').value) || null,
        description,
        stock,
        lowStockThreshold: parseInt(document.getElementById('pLowStock').value) || 5,
        category: finalCategory,
        customCategory: customCategoryName || undefined,
        status: document.getElementById('pStatus').value,
        featured: document.getElementById('pFeatured').checked,
        tags: document.getElementById('pTags').value.split(',').map(t => t.trim()).filter(Boolean),
        tiktok: document.getElementById('pTiktok').value.trim() || null,
        images: productImages
    };

    const btn = document.getElementById('saveProductBtn');
    btn.innerHTML = '<span class="spinner"></span> Saving...';
    btn.disabled = true;

    try {
        if (id) {
            await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
            showToast('Product updated successfully!', 'success');
        } else {
            await apiFetch('/products', { method: 'POST', body: JSON.stringify(body) });
            showToast('Product created!', 'success');
            resetForm();
        }
        // Bust admin cache + customer-facing product cache
        Object.keys(_cache).filter(k => k.startsWith('products_')).forEach(k => delete _cache[k]);
        delete _cache['overview'];
        try { localStorage.setItem('ag_cache_bust', Date.now().toString()); } catch(e) {}
        navigateTo('products');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.innerHTML = id ? 'Update Product' : 'Save Product';
        btn.disabled = false;
    }
}

// ─── IMAGE MANAGEMENT ──────────────────────────────
function addImageUrl() {
    const url = document.getElementById('imageUrlInput').value.trim();
    if (!url) return;
    if (!url.startsWith('http') && !url.startsWith('data:image')) { showToast('Enter a valid image URL', 'error'); return; }

    const isPrimary = productImages.length === 0;
    productImages.push({ url, alt: '', isPrimary });
    document.getElementById('imageUrlInput').value = '';
    renderImageList();
}

function handleImageFiles(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast('Only image files are allowed', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const isPrimary = productImages.length === 0;
            productImages.push({ url: e.target.result, alt: file.name, isPrimary });
            renderImageList();
        };
        reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
}

function removeImage(idx) {
    productImages.splice(idx, 1);
    if (productImages.length > 0) productImages[0].isPrimary = true;
    renderImageList();
}

function setPrimary(idx) {
    productImages.forEach((img, i) => img.isPrimary = i === idx);
    renderImageList();
}

function renderImageList() {
    const el = document.getElementById('imageList');
    el.innerHTML = productImages.map((img, i) => `
    <div class="image-item">
      <img src="${img.url}" alt="" onerror="this.style.opacity=0.3">
      <button class="remove-img" onclick="removeImage(${i})">✕</button>
      <span class="primary-star" onclick="setPrimary(${i})" title="Set as primary">${img.isPrimary ? '⭐' : '☆'}</span>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════
//  DELETE PRODUCT
// ═══════════════════════════════════════════════════
function confirmDelete(id, name) {
    document.getElementById('confirmMessage').textContent = `Delete "${name}"? This cannot be undone.`;
    document.getElementById('confirmYes').onclick = () => deleteProduct(id);
    document.getElementById('confirmOverlay').classList.remove('hidden');
}

async function deleteProduct(id) {
    closeConfirm();
    try {
        await apiFetch(`/products/${id}`, { method: 'DELETE' });
        showToast('Product deleted.', 'success');
        cacheSet('overview', null); delete _cache['overview'];
        Object.keys(_cache).filter(k => k.startsWith('products_')).forEach(k => delete _cache[k]);
        Object.keys(_cache).filter(k => k.startsWith('products_')).forEach(k => delete _cache[k]);
        try { localStorage.setItem('ag_cache_bust', Date.now().toString()); } catch(e) {}
        loadProducts();
        loadOverview();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function closeConfirm() {
    document.getElementById('confirmOverlay').classList.add('hidden');
}

// ═══════════════════════════════════════════════════
//  STOCK MANAGEMENT
// ═══════════════════════════════════════════════════
function openStockModal(id, name) {
    stockTargetId = id;
    document.getElementById('stockProductName').textContent = name;
    document.getElementById('stockAction').value = 'set';
    document.getElementById('stockQty').value = '1';
    document.getElementById('stockOverlay').classList.remove('hidden');
}

function closeStockModal() {
    document.getElementById('stockOverlay').classList.add('hidden');
    stockTargetId = null;
}

async function submitStockUpdate() {
    if (!stockTargetId) return;
    const action = document.getElementById('stockAction').value;
    const quantity = parseInt(document.getElementById('stockQty').value);

    if (isNaN(quantity) || quantity < 0) {
        showToast('Enter a valid quantity.', 'error');
        return;
    }

    try {
        const data = await apiFetch(`/products/${stockTargetId}/stock`, {
            method: 'PATCH',
            body: JSON.stringify({ action, quantity })
        });
        closeStockModal();
        showToast(data.alert || 'Stock updated!', data.alert ? 'error' : 'success');
        try { localStorage.setItem('ag_cache_bust', Date.now().toString()); } catch(e) {}
        loadProducts();
        loadOverview();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ═══════════════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════════════

let _categoriesLoaded = false;

async function loadCategories(renderPage = false) {
    try {
        // Only fetch from API if not already loaded (or if rendering the categories page)
        if (!_categoriesLoaded || renderPage) {
            const data = await apiFetch('/categories');
            categories = (data.categories || []).map(ac => ({
                _id: ac._id,
                name: ac.name,
                icon: ac.icon || '📦',
                productCount: ac.productCount || 0
            }));
            _categoriesLoaded = true;
        }

        populateCategoryDropdown('filterCategory');
        populateCategoryDropdown('pCategory');
        if (renderPage) renderCategoriesPage(categories);
    } catch (err) {
        console.warn('API categories load failed:', err);
        if (!_categoriesLoaded) categories = [];
        populateCategoryDropdown('filterCategory');
        populateCategoryDropdown('pCategory');
        if (renderPage) renderCategoriesPage(categories);
    }
}

function populateCategoryDropdown(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;

    // Keep the first "Select..." or "All..." option
    const firstOption = sel.options[0];
    sel.innerHTML = '';
    if (firstOption) sel.appendChild(firstOption);

    categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c._id;
        opt.textContent = `${c.icon || ''} ${c.name}`;
        sel.appendChild(opt);
    });
}

function handleCategoryChange() {
    const sel = document.getElementById('pCategory');
    const customWrap = document.getElementById('customCategoryWrap');
    if (!customWrap) return;
    if (sel.value === 'other') {
        customWrap.style.display = 'block';
        document.getElementById('customCategoryInput').focus();
    } else {
        customWrap.style.display = 'none';
        document.getElementById('customCategoryInput').value = '';
    }
}

function renderCategoriesPage(cats) {
    const el = document.getElementById('categoriesList');
    if (!cats.length) {
        el.innerHTML = `<p style="color:var(--text3);padding:1rem;font-size:0.8rem">No categories yet. Add one above.</p>`;
        return;
    }
    el.innerHTML = cats.map(c => `
    <div class="category-item">
      <span class="category-icon">${c.icon || '📦'}</span>
      <div>
        <div class="category-name">${esc(c.name)}</div>
        <div class="category-count">${c.productCount || 0} products</div>
      </div>
      <button class="category-del" onclick="deleteCategory('${c._id}','${esc(c.name)}')">✕</button>
    </div>
  `).join('');
}

async function addCategory() {
    const name = document.getElementById('catName').value.trim();
    const icon = '';
    if (!name) { showToast('Category name required.', 'error'); return; }

    try {
        await apiFetch('/categories', {
            method: 'POST',
            body: JSON.stringify({ name, icon })
        });
        document.getElementById('catName').value = '';
        document.getElementById('catIcon').value = '';
        _categoriesLoaded = false; showToast(`Category "${name}" added!`, 'success');
        loadCategories(true);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteCategory(id, name) {
    if (!confirm(`Delete category "${name}"? Products in this category won't be deleted.`)) return;
    try {
        await apiFetch(`/categories/${id}`, { method: 'DELETE' });
        _categoriesLoaded = false; showToast('Category deleted.', 'success');
        loadCategories(true);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ═══════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════
async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    const cached = cacheGet('orders');
    if (cached) {
        renderOrdersTable(cached);
    } else {
        tbody.innerHTML = `<tr><td colspan="6" class="table-loading"><span class="spinner"></span> Loading orders...</td></tr>`;
    }
    if (!cached || cacheIsStale('orders')) {
        try {
            const data = await apiFetch('/orders');
            cacheSet('orders', data);
            renderOrdersTable(data);
        } catch (err) {
            if (!cached) tbody.innerHTML = `<tr><td colspan="6" class="table-loading" style="color:var(--red)">${err.message}</td></tr>`;
            if (!cached) showToast(err.message, 'error');
        }
    }
}

function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    const orders = data.orders || [];

        if (!orders.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="table-loading">No orders found.</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => {
            const itemsHtml = o.items.map(i => `<div style="font-size:0.75rem; color:var(--text2)">${esc(i.qty)}x ${esc(i.name)}</div>`).join('');
            const dateStr = new Date(o.createdAt).toLocaleString();

            const statusOptions = [
                { val: 'confirmed', label: 'Confirmed' },
                { val: 'out_for_delivery', label: 'Out for Delivery' },
                { val: 'rider_close', label: 'Rider is Close' },
                { val: 'completed', label: 'Completed' }
            ];

            const selectHtml = `
        <select id="status-${o.trackId}" style="padding:0.2rem; border-radius:4px; font-size:0.8rem; background:var(--bg-light); border:1px solid var(--border);">
          ${statusOptions.map(opt => `<option value="${opt.val}" ${o.status === opt.val ? 'selected' : ''}>${opt.label}</option>`).join('')}
        </select>
      `;

            return `
        <tr>
          <td>
            <div style="font-family:var(--font-display); font-size:0.8rem; font-weight:700; color:var(--accent)">${o.trackId}</div>
            <div style="font-size:0.7rem; color:var(--text3); margin-top:0.2rem">${dateStr}</div>
            ${o.manualStatus ? '<span class="mini-badge badge-gray" style="margin-top:4px">Manual</span>' : '<span class="mini-badge badge-green" style="margin-top:4px">Auto</span>'}
          </td>
          <td>
            <div style="font-weight:600; font-size:0.9rem">${esc(o.name)}</div>
            <div style="font-size:0.75rem; color:var(--text2)">${esc(o.phone)}</div>
            <div style="font-size:0.75rem; color:var(--text3)">${esc(o.city)} - ${esc(o.address)}</div>
          </td>
          <td>${itemsHtml}</td>
          <td>
            <div style="font-weight:700; color:var(--text)">₦${o.total.toLocaleString()}</div>
            <div style="font-size:0.75rem; color:var(--text3)">Ship: ${esc(o.shippingFee)}</div>
          </td>
          <td>${selectHtml}</td>
          <td>
            <button class="btn-primary btn-sm" onclick="updateOrderStatus('${o.trackId}')">Update</button>
          </td>
        </tr>
      `;
        }).join('');


}

async function updateOrderStatus(trackId) {
    const select = document.getElementById(`status-${trackId}`);
    if (!select) return;
    const newStatus = select.value;
    const btn = select.closest('tr').querySelector('.btn-primary');

    const originalText = btn.textContent;
    btn.textContent = '...';
    btn.disabled = true;

    try {
        await apiFetch(`/orders/${trackId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        delete _cache['orders']; showToast('Order status updated!', 'success');
        loadOrders();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// ═══════════════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════════════
async function loadAnalytics() {
    const cached = cacheGet('analytics');
    if (cached) renderAnalyticsData(cached);
    if (!cached || cacheIsStale('analytics')) {
        try {
            const data = await apiFetch('/analytics/overview');
            cacheSet('analytics', data);
            renderAnalyticsData(data);
        } catch (err) {
            if (!cached) showToast(err.message, 'error');
        }
    }
}

async function renderAnalyticsData(data) {
    try {

        renderMiniList('topSellingList', data.topSelling, p => `
      <div class="mini-item">
        <img class="mini-img" src="${getThumb(p)}" alt="" onerror="this.style.opacity=0">
        <div class="mini-name">${esc(p.name)}</div>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <span class="mini-badge badge-green">${p.totalSold} sold</span>
          <span class="mini-meta">₦${(p.price || 0).toLocaleString()}</span>
        </div>
      </div>
    `, 'No sales data yet.');

        renderMiniList('analyticsTopViewed', data.topViewed, p => `
      <div class="mini-item">
        <img class="mini-img" src="${getThumb(p)}" alt="" onerror="this.style.opacity=0">
        <div class="mini-name">${esc(p.name)}</div>
        <span class="mini-badge badge-accent">${p.views} views</span>
      </div>
    `);

        renderMiniList('categoryBreakdown', data.categoryBreakdown, c => `
      <div class="mini-item">
        <span style="font-size:1.3rem">${c.icon || '📦'}</span>
        <div class="mini-name">${esc(c.name)}</div>
        <div style="text-align:right">
          <div class="mini-meta">${c.count} products</div>
          <div class="mini-meta">${c.totalViews} views</div>
        </div>
      </div>
    `);
    } catch (err) {
        // rendering errors are non-fatal
    }
}

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
function getThumb(product) {
    const primary = (product.images || []).find(i => i.isPrimary) || (product.images || [])[0];
    return primary ? primary.url : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%231c1f2e" width="40" height="40"/></svg>';
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

let toastTimer = null;
function showToast(message, type = 'success') {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.className = `toast ${type}`;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

// Close overlays on backdrop click
document.getElementById('confirmOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeConfirm();
});
document.getElementById('stockOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeStockModal();
});

// Trigger Vercel build
