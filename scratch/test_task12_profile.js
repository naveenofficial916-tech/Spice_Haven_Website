/**
 * Task 12 Verification Suite — Customer Profile & Order History
 */

const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Mock browser globals for JS modules
global.window = {};
global.document = {
  addEventListener: () => {},
  getElementById: (id) => null,
  querySelectorAll: (sel) => [],
  body: { style: {} }
};
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

const ProfileModule = require('../js/profile.js');

async function runTests() {
  console.log('--- STARTING TASK 12 VERIFICATION SUITE ---');
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

  // 1. Profile Module Initialization & Storage
  test('ProfileModule defaults to Spice Haven Connoisseur tier', () => {
    localStorage.clear();
    const prof = ProfileModule.getProfile();
    assert.strictEqual(prof.membershipTier, 'Spice Haven Connoisseur');
    assert.strictEqual(prof.diningPreference, 'The Grand Dining Room');
  });

  // 2. Profile Sync from Reservation
  test('ProfileModule syncs customer info from confirmed reservation record', () => {
    localStorage.clear();
    const mockRes = {
      bookingId: 'RES-998877',
      guestName: 'Eleanor Vance',
      guestEmail: 'eleanor@spicehaven.com',
      guestPhone: '+91 9876543210',
      diningArea: 'Spice Veranda Lounge',
      specialRequests: 'Nut allergy, prefers window table'
    };
    ProfileModule.syncFromReservation(mockRes);
    const prof = ProfileModule.getProfile();
    assert.strictEqual(prof.name, 'Eleanor Vance');
    assert.strictEqual(prof.email, 'eleanor@spicehaven.com');
    assert.strictEqual(prof.phone, '+91 9876543210');
    assert.strictEqual(prof.diningPreference, 'Spice Veranda Lounge');
    assert.strictEqual(prof.dietaryNotes, 'Nut allergy, prefers window table');
  });

  // 3. Profile Sync from Order
  test('ProfileModule syncs customer contact details from confirmed order', () => {
    localStorage.clear();
    const mockOrder = {
      orderId: 'SH-554433',
      customerName: 'Marcus Aurelius',
      customerPhone: '+91 9123456789'
    };
    ProfileModule.syncFromOrder(mockOrder);
    const prof = ProfileModule.getProfile();
    assert.strictEqual(prof.name, 'Marcus Aurelius');
    assert.strictEqual(prof.phone, '+91 9123456789');
  });

  // 4. Order History Empty State Rendering
  test('Empty state renders exact required prompt: "Your Spice Haven journey starts here."', () => {
    localStorage.clear();
    const emptyHtml = ProfileModule.renderOrdersEmptyStateHtml();
    assert.ok(emptyHtml.includes('Your Spice Haven journey starts here.'), 'Empty state text must be present');
    assert.ok(emptyHtml.includes('Explore Menu'), 'Explore Menu CTA must be present');
    assert.ok(emptyHtml.includes('ProfileModule.exploreMenu()'), 'Explore Menu action must be hooked');
  });

  // 5. Reservation Empty State Rendering
  test('Reservation empty state renders with Reserve a Table CTA', () => {
    localStorage.clear();
    const emptyResHtml = ProfileModule.renderReservationsEmptyStateHtml();
    assert.ok(emptyResHtml.includes('No table reservations recorded yet.'));
    assert.ok(emptyResHtml.includes('Reserve a Table'));
    assert.ok(emptyResHtml.includes('ProfileModule.openReservationModal()'));
  });

  // 6. Order History Rendering with Real Orders
  test('Order History renders reference number, date, items, total, and statuses', () => {
    localStorage.clear();
    const orders = [
      {
        orderId: 'SH-849201',
        products: [
          { id: 'dish-1', name: 'Nawabi Smoked Gosht Biryani', price: 950, qty: 2 },
          { id: 'dish-2', name: 'Saffron Pistachio Kulfi', price: 450, qty: 1 }
        ],
        subtotal: 2350,
        discount: 0,
        tax: 118,
        totalAmount: 2468,
        currencySymbol: '₹',
        diningMode: 'Dine-In Service',
        isPaid: true,
        orderStatus: 'Confirmed & Kitchen Preparing',
        paymentStatus: 'Paid / Razorpay Verified',
        submittedAt: '2026-09-22T20:30:00.000Z'
      }
    ];
    localStorage.setItem('spicehaven_orders', JSON.stringify(orders));

    const ordersHtml = ProfileModule.renderOrdersListHtml(orders);
    assert.ok(ordersHtml.includes('SH-849201'), 'Order ref must be visible');
    assert.ok(ordersHtml.includes('Nawabi Smoked Gosht Biryani'), 'Dish name must be visible');
    assert.ok(ordersHtml.includes('₹2,468'), 'Total amount formatted must be visible');
    assert.ok(ordersHtml.includes('Paid / Razorpay Verified'), 'Payment status badge must be visible');
    assert.ok(ordersHtml.includes('View Order Details'), 'Details trigger button must be present');
  });

  // 7. Order Details Itemized Breakdown
  test('Order Details renders complete financial and itemized breakdown', () => {
    const order = {
      orderId: 'SH-112233',
      products: [
        { id: 'dish-3', name: 'Black Truffle Dal Bukhara', price: 750, qty: 2 },
        { id: 'dish-4', name: 'Chur Chur Truffle Naan', price: 200, qty: 3 }
      ],
      subtotal: 2100,
      discount: 200,
      tax: 95,
      totalAmount: 1995,
      currencySymbol: '₹',
      diningMode: 'Sanctuary Table Service',
      isPaid: true,
      customerName: 'Aarav Patel',
      customerPhone: '+91 9988776655',
      paymentMethod: 'Razorpay Instant UPI',
      orderStatus: 'Confirmed & Kitchen Preparing',
      paymentStatus: 'Paid / Razorpay Verified',
      transactionRef: 'pay_MockOrderTest123'
    };

    const detailsHtml = ProfileModule.renderOrderDetailsHtml(order);
    assert.ok(detailsHtml.includes('SH-112233'), 'Order ref code present');
    assert.ok(detailsHtml.includes('Black Truffle Dal Bukhara'), 'Item present');
    assert.ok(detailsHtml.includes('Chur Chur Truffle Naan'), 'Item present');
    assert.ok(detailsHtml.includes('₹2,100'), 'Subtotal present');
    assert.ok(detailsHtml.includes('₹200'), 'Discount present');
    assert.ok(detailsHtml.includes('₹95'), 'Tax present');
    assert.ok(detailsHtml.includes('₹1,995'), 'Final total amount present');
    assert.ok(detailsHtml.includes('Aarav Patel'), 'Customer name present');
    assert.ok(detailsHtml.includes('pay_MockOrderTest123'), 'Transaction ref present');
  });

  // 8. Server API Integration Tests
  const server = require('../server.js');
  const PORT = 3050;

  await new Promise((resolve) => {
    server.listen(PORT, resolve);
  });

  // 8a. POST /api/customer/profile
  await asyncTest('Server API POST /api/customer/profile creates profile', async () => {
    const payload = JSON.stringify({
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@spicehaven.com',
      phone: '+91 9443322110',
      diningPreference: 'Royal Mezzanine',
      dietaryNotes: 'Prefers mild spices, celebratory anniversary'
    });

    const res = await makeRequest('/api/customer/profile', 'POST', payload);
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.profile.name, 'Rohan Deshmukh');
    assert.strictEqual(body.profile.diningPreference, 'Royal Mezzanine');
  });

  // 8b. GET /api/customer/profile
  await asyncTest('Server API GET /api/customer/profile retrieves existing profile', async () => {
    const res = await makeRequest('/api/customer/profile?email=rohan.deshmukh@spicehaven.com', 'GET');
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.exists, true);
    assert.strictEqual(body.profile.name, 'Rohan Deshmukh');
    assert.strictEqual(body.profile.phone, '+91 9443322110');
  });

  // 8c. Validation on POST /api/customer/profile
  await asyncTest('Server API POST /api/customer/profile rejects invalid payload', async () => {
    const invalidPayload = JSON.stringify({ name: '', email: 'not-an-email' });
    const res = await makeRequest('/api/customer/profile', 'POST', invalidPayload);
    assert.strictEqual(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.strictEqual(body.success, false);
  });

  // 8d. GET /api/customer/reservations
  await asyncTest('Server API GET /api/customer/reservations returns customer reservations', async () => {
    // Create reservation first
    const resPayload = JSON.stringify({
      guestName: 'Rohan Deshmukh',
      guestEmail: 'rohan.deshmukh@spicehaven.com',
      guestPhone: '+91 9443322110',
      guests: 4,
      date: '2026-10-15',
      timeSlot: '8:00 PM',
      diningArea: 'royal_mezzanine',
      occasion: 'Anniversary Celebration'
    });
    const createRes = await makeRequest('/api/reservations', 'POST', resPayload);
    assert.strictEqual(createRes.statusCode, 200);
    const createBody = JSON.parse(createRes.body);
    const bookingId = createBody.booking_id;

    // Query reservations by email
    const queryRes = await makeRequest('/api/customer/reservations?email=rohan.deshmukh@spicehaven.com', 'GET');
    assert.strictEqual(queryRes.statusCode, 200);
    const queryBody = JSON.parse(queryRes.body);
    assert.strictEqual(queryBody.success, true);
    assert.ok(queryBody.reservations.length >= 1);
    assert.strictEqual(queryBody.reservations[0].bookingId, bookingId);
  });

  // 8e. Privacy Isolation
  await asyncTest('Server API isolates customer queries (no data leakage)', async () => {
    const queryOther = await makeRequest('/api/customer/reservations?email=stranger@unknown.com', 'GET');
    assert.strictEqual(queryOther.statusCode, 200);
    const body = JSON.parse(queryOther.body);
    assert.strictEqual(body.count, 0);
    assert.deepStrictEqual(body.reservations, []);
  });

  server.close();

  console.log(`\n========================================`);
  console.log(`TASK 12 RESULTS: ${passed} / ${total} TESTS PASSED`);
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
      port: 3050,
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
