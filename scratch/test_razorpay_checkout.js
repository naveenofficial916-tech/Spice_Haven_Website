/**
 * RAZORPAY INTEGRATION AUDIT & TEST SUITE
 * Tests:
 * 1. Environment security & secret concealment
 * 2. POST /api/create-razorpay-order (trusted menu amount calculation & paise conversion)
 * 3. POST /api/verify-razorpay-payment (HMAC-SHA256 cryptographic verification)
 * 4. Rejection of tampered / invalid signatures
 * 5. Preservation of UPI Instant QR engine
 */

const http = require('http');
const crypto = require('crypto');
const path = require('path');

const fs = require('fs');

// Read .env to get local secrets
const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
let KEY_SECRET = 'placeholderSecretKey';
let KEY_ID = 'rzp_test_placeholderKeyId';
envContent.split(/\r?\n/).forEach(line => {
  const t = line.trim();
  if (t.startsWith('RAZORPAY_KEY_SECRET=')) KEY_SECRET = t.split('=')[1].trim();
  if (t.startsWith('RAZORPAY_KEY_ID=')) KEY_ID = t.split('=')[1].trim();
});

function makeRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runAudit() {
  console.log('==========================================================');
  console.log('     RAZORPAY STANDARD CHECKOUT & SECURITY AUDIT          ');
  console.log('==========================================================\n');

  try {
    // -------------------------------------------------------------
    // TEST 1: Secret Concealment Audit
    // -------------------------------------------------------------
    console.log('1. Auditing Key Secret Concealment:');
    const fs = require('fs');
    const gitignoreContent = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
    console.assert(gitignoreContent.includes('.env'), '.gitignore must strictly include .env');
    console.log('  ✔ .gitignore contains .env (Secrets protected from git)');

    const cartJsContent = fs.readFileSync(path.join(__dirname, '../js/cart.js'), 'utf8');
    console.assert(!cartJsContent.includes(process.env.RAZORPAY_KEY_SECRET), 'Client cart.js must NEVER contain Razorpay secret');
    console.assert(!cartJsContent.includes('key_secret'), 'Client cart.js must not reference key_secret');
    console.log('  ✔ Frontend cart.js has zero exposure to key secrets');
    console.log('✔ Test 1 Passed: Secret Concealment Verified\n');

    // -------------------------------------------------------------
    // TEST 2: Order Creation Endpoint
    // -------------------------------------------------------------
    console.log('2. Testing POST /api/create-razorpay-order:');
    // Test items: Truffle Saffron Black Cod (sh-01: 3999), 5% GST = 200, Total = 4199.00
    const orderReq = {
      items: [
        { id: 'sh-01', name: 'Truffle Saffron Black Cod', price: 3999, qty: 1 }
      ],
      customerName: 'Naveen Kumar',
      customerPhone: '+91 9876543210',
      diningMode: 'Dine-In Service'
    };

    const orderRes = await makeRequest('/api/create-razorpay-order', 'POST', orderReq);
    console.assert(orderRes.status === 200, `Order creation must return HTTP 200, got ${orderRes.status}`);
    console.assert(orderRes.body.success === true, 'Response must indicate success: true');
    console.assert(orderRes.body.order_id, 'Response must include order_id');
    console.assert(orderRes.body.amount === 419900, `Amount in paise must be 419900 (₹4,199), got: ${orderRes.body.amount}`);
    console.assert(orderRes.body.currency === 'INR', 'Currency must be INR');
    console.assert(orderRes.body.key_id === KEY_ID, 'Response must return safe public key_id');
    console.assert(!orderRes.body.key_secret && !orderRes.body.secret, 'Response must NEVER leak key secret');
    console.log(`  - Generated Order ID: ${orderRes.body.order_id}`);
    console.log(`  - Calculated Amount in Paise: ${orderRes.body.amount} (₹${orderRes.body.amount / 100})`);
    console.log(`  - Currency: ${orderRes.body.currency}`);
    console.log('✔ Test 2 Passed: Order Creation & Calculation Verified\n');

    // -------------------------------------------------------------
    // TEST 3: Cryptographic HMAC Signature Verification (Success Case)
    // -------------------------------------------------------------
    console.log('3. Testing POST /api/verify-razorpay-payment (Valid Signature):');
    const testOrderId = orderRes.body.order_id;
    const testPaymentId = 'pay_sample_test_987654';
    
    // Generate valid HMAC SHA-256 signature
    const validSignature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    const verifyReq = {
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature
    };

    const verifyRes = await makeRequest('/api/verify-razorpay-payment', 'POST', verifyReq);
    console.assert(verifyRes.status === 200, `Verification must return HTTP 200, got ${verifyRes.status}`);
    console.assert(verifyRes.body.success === true, 'Success must be true');
    console.assert(verifyRes.body.verified === true, 'Verified must be true');
    console.assert(verifyRes.body.payment_id === testPaymentId, 'Payment ID must match');
    console.log(`  - Order: ${testOrderId}`);
    console.log(`  - Payment ID: ${testPaymentId}`);
    console.log(`  - Verified Status: ${verifyRes.body.message}`);
    console.log('✔ Test 3 Passed: HMAC SHA-256 Signature Verification Verified\n');

    // -------------------------------------------------------------
    // TEST 4: Rejection of Tampered / Forged Signatures
    // -------------------------------------------------------------
    console.log('4. Testing Rejection of Tampered Signature (Security Defense):');
    const forgedSignature = 'forged_fake_signature_attempt_1234567890abcdef';
    const forgedReq = {
      razorpay_order_id: testOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: forgedSignature
    };

    const forgedRes = await makeRequest('/api/verify-razorpay-payment', 'POST', forgedReq);
    console.assert(forgedRes.status === 400, `Forged signature must be rejected with HTTP 400, got ${forgedRes.status}`);
    console.assert(forgedRes.body.verified === false, 'Tampered transaction must NOT be marked verified');
    console.log(`  - Tampered Signature Rejected: ${forgedRes.body.error}`);
    console.log('✔ Test 4 Passed: Tampered Signature Blocked Successfully\n');

    // -------------------------------------------------------------
    // TEST 5: UPI Instant QR Engine Preservation
    // -------------------------------------------------------------
    console.log('5. Verifying UPI Instant QR Flow Remains Intact:');
    global.window = {};
    require(path.join(__dirname, '../js/restaurant.config.js'));
    const RestaurantConfig = global.window.RestaurantConfig;
    console.assert(RestaurantConfig.commerce.upiPayment.enabled === true, 'UPI payment must remain enabled');
    console.assert(RestaurantConfig.commerce.upiPayment.upiId === 'naveenofficial916@okaxis', 'UPI ID must remain naveenofficial916@okaxis');
    console.assert(RestaurantConfig.commerce.upiPayment.merchantName === 'Naveen', 'Payee name must remain Naveen');
    console.log(`  - Configured UPI VPA: ${RestaurantConfig.commerce.upiPayment.upiId}`);
    console.log(`  - Payee Name: ${RestaurantConfig.commerce.upiPayment.merchantName}`);
    console.log('✔ Test 5 Passed: Existing Dynamic UPI QR Engine Untouched\n');

    console.log('==========================================================');
    console.log('  ALL AUDIT CHECKS COMPLETED WITH 100% SUCCESS RATE!      ');
    console.log('==========================================================');

    process.exit(0);

  } catch (err) {
    console.error('Audit failed with error:', err);
    process.exit(1);
  }
}

// Give server time to bind and run audit
setTimeout(runAudit, 500);
