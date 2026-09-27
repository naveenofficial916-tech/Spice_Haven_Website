/**
 * Task 13 Verification Suite — Favorites & Personalized Menu
 */

const assert = require('assert');
const http = require('http');

// Mock browser globals
global.window = {};
global.document = {
  addEventListener: () => {},
  getElementById: (id) => null,
  querySelectorAll: (sel) => [],
  body: { style: {} }
};
global.sessionStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

// Load restaurant config
require('../js/restaurant.config.js');
const FavoritesModule = require('../js/favorites.js');
const MenuModule = require('../js/menu.js');
global.window.FavoritesModule = FavoritesModule;
global.window.MenuModule = MenuModule;

async function runTests() {
  console.log('--- STARTING TASK 13 VERIFICATION SUITE ---');
  let passed = 0;
  let total = 0;

  function test(description, fn) {
    total++;
    try {
      fn();
      console.log(`✓ [PASS] ${description}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] ${description}:`, err.message);
    }
  }

  async function asyncTest(description, fn) {
    total++;
    try {
      await fn();
      console.log(`✓ [PASS] ${description}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] ${description}:`, err.message);
    }
  }

  // 1. Favorite toggle logic
  await asyncTest('FavoritesModule toggles favorite dishes and persists to localStorage', async () => {
    localStorage.clear();
    assert.strictEqual(FavoritesModule.isFavorite('sh-01'), false);
    await FavoritesModule.toggle('sh-01');
    assert.strictEqual(FavoritesModule.isFavorite('sh-01'), true);
    assert.deepStrictEqual(FavoritesModule.getFavorites(), ['sh-01']);

    await FavoritesModule.toggle('sh-01');
    assert.strictEqual(FavoritesModule.isFavorite('sh-01'), false);
    assert.deepStrictEqual(FavoritesModule.getFavorites(), []);
  });

  // 2. Favorite multiple items
  await asyncTest('FavoritesModule handles multiple favorited items correctly', async () => {
    localStorage.clear();
    await FavoritesModule.toggle('sh-01');
    await FavoritesModule.toggle('sh-02');
    await FavoritesModule.toggle('sh-03');

    const favs = FavoritesModule.getFavorites();
    assert.strictEqual(favs.length, 3);
    assert.ok(favs.includes('sh-01'));
    assert.ok(favs.includes('sh-02'));
    assert.ok(favs.includes('sh-03'));

    const items = FavoritesModule.getFavoriteItems();
    assert.strictEqual(items.length, 3);
    assert.strictEqual(items[0].id, 'sh-01');
  });

  // 3. Exact Empty State for Favorites
  test('Empty state renders exact required prompt: "Your favorite flavors will appear here."', () => {
    localStorage.clear();
    const emptyHtml = FavoritesModule.renderEmptyStateHtml();
    assert.ok(emptyHtml.includes('Your favorite flavors will appear here.'), 'Empty state heading must be present');
    assert.ok(emptyHtml.includes('Explore Menu'), 'Explore Menu CTA must be present');
    assert.ok(emptyHtml.includes('FavoritesModule.exploreMenu()'), 'Explore menu action must be hooked');
  });

  // 4. Personalized Discovery: Order Again (Real Past Orders)
  test('Order Again extracts distinct dishes from genuine completed orders without inventing data', () => {
    localStorage.clear();
    const orders = [
      {
        orderId: 'SH-101',
        products: [
          { id: 'sh-01', name: 'Charcoal Smoked Black Cod Tikka', price: 1450, qty: 2 },
          { id: 'sh-04', name: 'Old Delhi Butter Chicken Grand Cru', price: 950, qty: 1 }
        ]
      },
      {
        orderId: 'SH-102',
        products: [
          { id: 'sh-01', name: 'Charcoal Smoked Black Cod Tikka', price: 1450, qty: 1 }
        ]
      }
    ];
    localStorage.setItem('spicehaven_orders', JSON.stringify(orders));

    const reorderItems = FavoritesModule.getOrderAgainItems();
    assert.strictEqual(reorderItems.length, 2);
    // sh-01 was ordered 3 times total, should be first
    assert.strictEqual(reorderItems[0].id, 'sh-01');
    assert.strictEqual(reorderItems[0].orderCount, 3);
    assert.strictEqual(reorderItems[1].id, 'sh-04');
    assert.strictEqual(reorderItems[1].orderCount, 1);
  });

  // 5. Personalized Discovery: Recently Viewed (Session Tracking)
  test('Recently Viewed tracks inspected dishes in session', () => {
    sessionStorage.clear();
    FavoritesModule.trackView('sh-05');
    FavoritesModule.trackView('sh-06');

    const recent = FavoritesModule.getRecentlyViewedItems();
    assert.strictEqual(recent.length, 2);
    assert.strictEqual(recent[0].id, 'sh-06'); // Most recent first
    assert.strictEqual(recent[1].id, 'sh-05');
  });

  // 6. Menu Module Integration: matchesCategory('favorites')
  await asyncTest('MenuModule filters catalog by favorited dishes', async () => {
    localStorage.clear();
    const sampleItem = { id: 'sh-02', name: 'Galouti Kebab' };
    assert.strictEqual(MenuModule.matchesCategory(sampleItem, 'favorites'), false);

    await FavoritesModule.toggle('sh-02');
    assert.strictEqual(MenuModule.matchesCategory(sampleItem, 'favorites'), true);
  });

  // 7. Backend API Integration for Favorites
  const server = require('../server.js');
  const PORT = 3060;

  await new Promise((resolve) => {
    server.listen(PORT, resolve);
  });

  // 7a. POST /api/customer/favorites
  await asyncTest('Server API POST /api/customer/favorites saves customer favorites', async () => {
    const payload = JSON.stringify({
      email: 'aaliyah.roy@spicehaven.com',
      favorites: ['sh-01', 'sh-02', 'sh-05']
    });

    const res = await makeRequest('/api/customer/favorites', 'POST', payload);
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.count, 3);
    assert.deepStrictEqual(body.favorites, ['sh-01', 'sh-02', 'sh-05']);
  });

  // 7b. GET /api/customer/favorites
  await asyncTest('Server API GET /api/customer/favorites retrieves user favorites', async () => {
    const res = await makeRequest('/api/customer/favorites?email=aaliyah.roy@spicehaven.com', 'GET');
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.count, 3);
    assert.deepStrictEqual(body.favorites, ['sh-01', 'sh-02', 'sh-05']);
  });

  // 7c. Toggle item via API
  await asyncTest('Server API POST /api/customer/favorites supports single item action', async () => {
    const payload = JSON.stringify({
      email: 'aaliyah.roy@spicehaven.com',
      itemId: 'sh-02',
      action: 'remove'
    });

    const res = await makeRequest('/api/customer/favorites', 'POST', payload);
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.count, 2);
    assert.deepStrictEqual(body.favorites, ['sh-01', 'sh-05']);
  });

  // 7d. Privacy Isolation
  await asyncTest('Server API strictly isolates customer favorites (no data leakage)', async () => {
    const resOther = await makeRequest('/api/customer/favorites?email=other_patron@spicehaven.com', 'GET');
    assert.strictEqual(resOther.statusCode, 200);
    const body = JSON.parse(resOther.body);
    assert.strictEqual(body.count, 0);
    assert.deepStrictEqual(body.favorites, []);
  });

  server.close();

  console.log(`\n========================================`);
  console.log(`TASK 13 RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

function makeRequest(urlPath, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3060,
      path: urlPath,
      method: method,
      headers: {}
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

runTests();
