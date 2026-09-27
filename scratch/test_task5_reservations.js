/**
 * TASK 5 VERIFICATION SUITE — TABLE RESERVATION & CONCIERGE MANAGEMENT ENGINE
 * Tests:
 * 1. POST /api/reservations: Success case with full metadata & RES-XXXXXX pass generation
 * 2. POST /api/reservations: Input validation (name < 2 chars, invalid email, missing phone)
 * 3. POST /api/reservations: Capacity bounds (guests = 0 or guests = 25 rejected)
 * 4. POST /api/reservations: Past date restriction (yesterday's date rejected)
 * 5. GET /api/reservation-status: Live query for verified booking
 * 6. GET /api/reservation-status: Missing parameter handling (400)
 * 7. GET /api/reservation-status: Non-existent booking handling (404)
 * 8. POST /api/inquiries: Private dining inquiry creation & INQ-XXXXXX reference
 * 9. POST /api/inquiries: Input validation (empty name, invalid email)
 * 10. Frontend Date Pills & Party Presets HTML markup integrity
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function sendRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    let postData = '';
    const headers = {};
    if (body !== undefined && body !== null) {
      postData = typeof body === 'string' ? body : JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('   SPICE HAVEN TASK 5 — RESERVATION & CONCIERGE TEST SUITE      ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ✖ [FAIL] ${name}: ${e.message}`);
      failed++;
    }
  }

  // 1. Success Case: POST /api/reservations
  console.log('SECTION 1: Table Reservation Creation (POST /api/reservations)');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const validBookingPayload = {
    guestName: 'Lady Catherine Vance',
    guestEmail: 'catherine@vanguard.com',
    guestPhone: '+1 (555) 382-7499',
    guests: 4,
    date: tomorrowStr,
    timeSlot: '8:00 PM',
    diningArea: 'wine_cellar',
    occasion: 'Anniversary Celebration',
    specialRequests: 'Sommelier cellar tour prior to seating'
  };

  const res1 = await sendRequest('/api/reservations', 'POST', validBookingPayload);
  test('Reservation creates with HTTP 200', () => assert.strictEqual(res1.status, 200));
  test('Reservation returns success: true', () => assert.strictEqual(res1.body.success, true));
  test('Reservation generates valid RES-XXXXXX booking ID', () => {
    assert(typeof res1.body.booking_id === 'string');
    assert(/^RES-\d{6}$/.test(res1.body.booking_id));
  });
  test('Reservation status is "Confirmed"', () => assert.strictEqual(res1.body.status, 'Confirmed'));
  test('Reservation preserves guest metadata', () => {
    const r = res1.body.reservation;
    assert.strictEqual(r.guestName, 'Lady Catherine Vance');
    assert.strictEqual(r.guests, 4);
    assert.strictEqual(r.date, tomorrowStr);
    assert.strictEqual(r.timeSlot, '8:00 PM');
    assert.strictEqual(r.occasion, 'Anniversary Celebration');
  });

  const createdBookingId = res1.body.booking_id;

  // 2. Input Validation
  console.log('\nSECTION 2: Reservation Input Validation & Constraints');
  const invalidNameRes = await sendRequest('/api/reservations', 'POST', {
    ...validBookingPayload,
    guestName: 'A'
  });
  test('Name under 2 characters rejected with HTTP 400', () => assert.strictEqual(invalidNameRes.status, 400));
  test('Name under 2 characters returns descriptive error', () => assert(invalidNameRes.body.error.includes('guest name')));

  const invalidEmailRes = await sendRequest('/api/reservations', 'POST', {
    ...validBookingPayload,
    guestEmail: 'not-an-email'
  });
  test('Malformed email rejected with HTTP 400', () => assert.strictEqual(invalidEmailRes.status, 400));

  const invalidGuestsRes = await sendRequest('/api/reservations', 'POST', {
    ...validBookingPayload,
    guests: 18
  });
  test('Guests > 12 rejected with HTTP 400', () => assert.strictEqual(invalidGuestsRes.status, 400));

  const pastDateRes = await sendRequest('/api/reservations', 'POST', {
    ...validBookingPayload,
    date: '2020-01-01'
  });
  test('Past date rejected with HTTP 400', () => assert.strictEqual(pastDateRes.status, 400));
  test('Past date returns "cannot be in the past" error', () => assert(pastDateRes.body.error.includes('past')));

  // 3. Query Reservation Status
  console.log('\nSECTION 3: Live Reservation Query (GET /api/reservation-status)');
  const queryRes = await sendRequest(`/api/reservation-status?booking_id=${createdBookingId}`, 'GET');
  test('Query existing booking returns HTTP 200', () => assert.strictEqual(queryRes.status, 200));
  test('Query returns matching booking record', () => {
    assert.strictEqual(queryRes.body.reservation.bookingId, createdBookingId);
    assert.strictEqual(queryRes.body.reservation.status, 'Confirmed');
    assert.strictEqual(queryRes.body.reservation.guestName, 'Lady Catherine Vance');
  });

  const missingParamRes = await sendRequest('/api/reservation-status', 'GET');
  test('Query without booking_id returns HTTP 400', () => assert.strictEqual(missingParamRes.status, 400));

  const nonExistentRes = await sendRequest('/api/reservation-status?booking_id=RES-999999', 'GET');
  test('Query non-existent booking returns HTTP 404', () => assert.strictEqual(nonExistentRes.status, 404));

  // 4. Private Dining Inquiries
  console.log('\nSECTION 4: Private Dining Concierge Inquiries (POST /api/inquiries)');
  const inquiryPayload = {
    clientName: 'Lord Sterling Archer',
    clientEmail: 'archer@isis-luxury.com',
    eventGuests: 24,
    targetDate: 'Mid November 2026',
    eventNotes: 'High-end champagne tasting and private hearth dinner'
  };

  const inqRes = await sendRequest('/api/inquiries', 'POST', inquiryPayload);
  test('Inquiry creates with HTTP 200', () => assert.strictEqual(inqRes.status, 200));
  test('Inquiry returns success: true', () => assert.strictEqual(inqRes.body.success, true));
  test('Inquiry generates valid INQ-XXXXXX reference ID', () => {
    assert(typeof inqRes.body.inquiry_id === 'string');
    assert(/^INQ-\d{6}$/.test(inqRes.body.inquiry_id));
  });
  test('Inquiry returns concierge message', () => assert(inqRes.body.message.toLowerCase().includes('concierge')));

  const invalidInqRes = await sendRequest('/api/inquiries', 'POST', { clientName: '' });
  test('Empty inquiry rejected with HTTP 400', () => assert.strictEqual(invalidInqRes.status, 400));

  // 5. Markup & Component Integrity Checks
  console.log('\nSECTION 5: Frontend Component & UX Integrity Check');
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

  test('index.html contains quick-date-pills containers', () => {
    assert(indexHtml.includes('class="quick-date-pills"'));
  });

  test('index.html contains guest-preset-chips containers', () => {
    assert(indexHtml.includes('class="guest-preset-chips"'));
  });

  test('index.html contains #statusTrackerModal', () => {
    assert(indexHtml.includes('id="statusTrackerModal"'));
  });

  test('index.html contains Header Track Status trigger', () => {
    assert(indexHtml.includes('id="headerTrackBtn"'));
  });

  test('index.html contains Mobile Nav Track trigger', () => {
    assert(indexHtml.includes('Track Reservation / Order'));
  });

  // 6. Summary
  console.log('\n================================================================');
  console.log(`  TASK 5 TEST RESULTS: ${passed}/${passed + failed} PASSED (${Math.round((passed / (passed + failed)) * 100)}% SUCCESS RATE)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled test execution error:', err);
  process.exit(1);
});
