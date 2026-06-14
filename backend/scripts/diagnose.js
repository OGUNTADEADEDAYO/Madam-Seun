// Full Backend Diagnostics Script for Madam Seun
const BASE = 'http://localhost:5000/api';

async function test(name, url, options = {}) {
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        const status = res.ok ? '✅' : '⚠️';
        console.log(`${status} [${res.status}] ${name}`);
        if (!res.ok) console.log(`   Error: ${data.error || JSON.stringify(data)}`);
        return { ok: res.ok, status: res.status, data };
    } catch (e) {
        console.log(`❌ FAIL  ${name} — ${e.message}`);
        return { ok: false, error: e.message };
    }
}

async function run() {
    console.log('═══════════════════════════════════════');
    console.log('  MADAM SEUN BACKEND — FULL DIAGNOSTIC');
    console.log('═══════════════════════════════════════\n');

    // 1. Health
    console.log('── 1. Health Check ──');
    await test('GET /api/health', `${BASE}/health`);

    // 2. Auth — Login
    console.log('\n── 2. Authentication ──');
    const loginResult = await test('POST /api/auth/login', `${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'adminpassword123' })
    });
    
    const token = loginResult.data?.token;
    if (!token) {
        console.log('❌ Cannot continue without auth token. Aborting.');
        return;
    }
    console.log(`   Token received: ${token.substring(0, 20)}...`);

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 3. Products
    console.log('\n── 3. Products ──');
    await test('GET /api/products', `${BASE}/products?adminView=true&page=1&limit=5`);
    await test('GET /api/products/stats', `${BASE}/products/stats`, { headers: authHeaders });

    // 4. Categories
    console.log('\n── 4. Categories ──');
    await test('GET /api/categories', `${BASE}/categories`);

    // 5. Orders
    console.log('\n── 5. Orders ──');
    await test('GET /api/orders', `${BASE}/orders`, { headers: authHeaders });

    // 6. Analytics
    console.log('\n── 6. Analytics ──');
    await test('GET /api/analytics/overview', `${BASE}/analytics/overview`, { headers: authHeaders });

    // 7. Test CORS for null origin (local file access)
    console.log('\n── 7. CORS Check (null origin) ──');
    const corsResult = await test('OPTIONS /api/health (CORS preflight)', `${BASE}/health`, {
        method: 'OPTIONS',
        headers: { 'Origin': 'null', 'Access-Control-Request-Method': 'GET' }
    });

    console.log('\n═══════════════════════════════════════');
    console.log('  DIAGNOSTIC COMPLETE');
    console.log('═══════════════════════════════════════');
}

run();
