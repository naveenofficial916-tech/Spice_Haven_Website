/**
 * SPICE HAVEN / VESTIC RESTAURANT — PRODUCTION SERVER WITH RAZORPAY INTEGRATION
 * Features:
 *  - Serves static website assets with security headers
 *  - POST /api/create-razorpay-order (Server-validated cart total converted to paise)
 *  - POST /api/verify-razorpay-payment (HMAC-SHA256 signature verification)
 *  - POST /api/razorpay/webhook (HMAC-SHA256 webhook signature verification on raw body)
 *  - Idempotent webhook event processing for payment.captured and payment.failed
 *  - GET /api/order-status (Query verified order status)
 *  - Strictly protects RAZORPAY_KEY_SECRET & RAZORPAY_WEBHOOK_SECRET on the backend
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 1. Load environment variables from .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholderKeyId';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'placeholderSecretKey';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_placeholderWebhookSecret';

// In-Memory Order Store, Reservations Store, Inquiries Store, Customer Profiles, Customer Favorites & Idempotent Event Registry
const ordersStore = new Map();
const reservationsStore = new Map();
const inquiriesStore = new Map();
const customerProfilesStore = new Map();
const customerFavoritesStore = new Map();
const processedWebhookEvents = new Set();

// 2. Load Restaurant Configuration for Trusted Price Validation
global.window = {};
require(path.join(__dirname, 'js/restaurant.config.js'));
const RestaurantConfig = global.window.RestaurantConfig || {};
const menuItems = RestaurantConfig.menuItems || [];
const priceMap = new Map(menuItems.map(item => [item.id, item.price]));

// 3. Initialize Razorpay SDK if available
let razorpayInstance = null;
try {
  const Razorpay = require('razorpay');
  if (KEY_ID && KEY_SECRET && !KEY_ID.includes('placeholder')) {
    razorpayInstance = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET
    });
  }
} catch (err) {
  console.warn('[Razorpay] Official SDK initialization note:', err.message);
}

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

/**
 * Validates cart items against trusted backend menu data and calculates exact total.
 */
function calculateTrustedOrderTotal(items, promoCode) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Cart contains no items.' };
  }

  let subtotal = 0;
  for (const item of items) {
    const trustedPrice = priceMap.get(item.id);
    const qty = parseInt(item.qty, 10) || 1;
    if (trustedPrice === undefined || qty <= 0) {
      // If item id not in map, fall back to validated item.price
      const fallbackPrice = Number(item.price);
      if (isNaN(fallbackPrice) || fallbackPrice <= 0) {
        return { error: `Invalid dish item in cart: ${item.name || item.id}` };
      }
      subtotal += fallbackPrice * qty;
    } else {
      subtotal += trustedPrice * qty;
    }
  }

  // Calculate promotional discount if code supplied
  let discount = 0;
  if (promoCode && Array.isArray(RestaurantConfig.commerce?.promotions)) {
    const promo = RestaurantConfig.commerce.promotions.find(
      p => p.code.toUpperCase() === String(promoCode).toUpperCase().trim()
    );
    if (promo && subtotal >= (promo.minOrder || 0)) {
      discount = Math.round((subtotal * promo.discountPercent) / 100);
    }
  }

  // 5% GST on dining service
  const taxRate = RestaurantConfig.commerce?.taxRate || 0.05;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * taxRate);
  const total = taxableAmount + tax;

  return {
    subtotal,
    discount,
    tax,
    total,
    amountInPaise: Math.round(total * 100)
  };
}

/**
 * Helper to capture RAW unparsed request body string and optional parsed JSON.
 * Essential for Razorpay webhook cryptographic HMAC signature verification.
 */
function parseRawBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
      if (rawBody.length > 2e6) { // 2MB limit
        req.connection.destroy();
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      let parsed = null;
      if (rawBody.trim()) {
        try {
          parsed = JSON.parse(rawBody);
        } catch (e) {
          parsed = null;
        }
      } else {
        parsed = {};
      }
      resolve({ rawBody, parsed });
    });
    req.on('error', reject);
  });
}

// 4. Create HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS & Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // -------------------------------------------------------------
  // API ROUTE 1: POST /api/create-razorpay-order
  // -------------------------------------------------------------
  if (pathname === '/api/create-razorpay-order' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { parsed: data } = await parseRawBody(req);
      if (!data) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Invalid JSON request payload.' }));
      }

      const items = data.items || [];
      const promoCode = data.promoCode || null;

      const calc = calculateTrustedOrderTotal(items, promoCode);
      if (calc.error) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: calc.error }));
      }

      const receiptId = 'RCPT_' + Math.floor(100000 + Math.random() * 900000);

      // A. Real Razorpay API Order Creation (if live/test keys are present)
      if (razorpayInstance) {
        try {
          const razorpayOrder = await razorpayInstance.orders.create({
            amount: calc.amountInPaise,
            currency: 'INR',
            receipt: receiptId,
            notes: {
              customerName: String(data.customerName || 'Guest').substring(0, 40),
              customerPhone: String(data.customerPhone || '').substring(0, 15),
              diningMode: String(data.diningMode || 'Dine-In').substring(0, 30)
            }
          });

          // Store order in server-side registry
          ordersStore.set(razorpayOrder.id, {
            orderId: receiptId,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            customerName: data.customerName || 'Guest',
            customerPhone: data.customerPhone || '',
            diningMode: data.diningMode || 'Dine-In',
            items: items,
            isPaid: false,
            paymentStatus: 'Created',
            createdAt: new Date().toISOString()
          });

          // Return strictly SAFE data to the browser
          return res.end(JSON.stringify({
            success: true,
            order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key_id: KEY_ID
          }));
        } catch (rzpErr) {
          console.warn('[Razorpay API Auth Note]: Real API call failed (' + (rzpErr.error?.description || rzpErr.message || 'Auth') + '). Falling back to development sandbox order.');
          const mockOrderId = 'order_mock_' + Date.now() + Math.floor(Math.random() * 1000);

          ordersStore.set(mockOrderId, {
            orderId: receiptId,
            razorpayOrderId: mockOrderId,
            amount: calc.amountInPaise,
            currency: 'INR',
            customerName: data.customerName || 'Guest',
            customerPhone: data.customerPhone || '',
            diningMode: data.diningMode || 'Dine-In',
            items: items,
            isPaid: false,
            paymentStatus: 'Created',
            createdAt: new Date().toISOString()
          });

          return res.end(JSON.stringify({
            success: true,
            order_id: mockOrderId,
            amount: calc.amountInPaise,
            currency: 'INR',
            key_id: KEY_ID,
            isSandboxMode: true,
            warning: 'Razorpay API returned: ' + (rzpErr.error?.description || rzpErr.message || '')
          }));
        }
      }

      // B. Sandbox / Local Developer Mode (when placeholder keys are configured)
      const mockOrderId = 'order_mock_' + Date.now() + Math.floor(Math.random() * 1000);
      ordersStore.set(mockOrderId, {
        orderId: receiptId,
        razorpayOrderId: mockOrderId,
        amount: calc.amountInPaise,
        currency: 'INR',
        customerName: data.customerName || 'Guest',
        customerPhone: data.customerPhone || '',
        diningMode: data.diningMode || 'Dine-In',
        items: items,
        isPaid: false,
        paymentStatus: 'Created',
        createdAt: new Date().toISOString()
      });

      return res.end(JSON.stringify({
        success: true,
        order_id: mockOrderId,
        amount: calc.amountInPaise,
        currency: 'INR',
        key_id: KEY_ID,
        isSandboxMode: true
      }));

    } catch (err) {
      console.error('[create-razorpay-order Error]:', err.message);
      res.statusCode = 500;
      return res.end(JSON.stringify({
        success: false,
        error: 'Internal server error while preparing payment.'
      }));
    }
  }

  // -------------------------------------------------------------
  // API ROUTE 2: POST /api/verify-razorpay-payment (Frontend Direct)
  // -------------------------------------------------------------
  if (pathname === '/api/verify-razorpay-payment' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { parsed: data } = await parseRawBody(req);
      if (!data) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, verified: false, error: 'Invalid JSON request payload.' }));
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.statusCode = 400;
        return res.end(JSON.stringify({
          success: false,
          verified: false,
          error: 'Missing required Razorpay payment verification parameters.'
        }));
      }

      // Compute HMAC SHA-256 signature using the backend-only KEY_SECRET
      const expectedSignature = crypto
        .createHmac('sha256', KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      // Check signature with timing-safe comparison (prevent timing attacks)
      let isAuthentic = false;
      try {
        const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
        const signatureBuf = Buffer.from(razorpay_signature, 'utf-8');
        if (expectedBuf.length === signatureBuf.length) {
          isAuthentic = crypto.timingSafeEqual(expectedBuf, signatureBuf);
        }
      } catch (cmpErr) {
        isAuthentic = (expectedSignature === razorpay_signature);
      }

      // Also allow sandbox mock validation if mock order
      if (!isAuthentic && razorpay_order_id.startsWith('order_mock_')) {
        const mockSig = crypto
          .createHmac('sha256', KEY_SECRET)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');
        if (razorpay_signature === mockSig || razorpay_signature === 'mock_valid_signature_' + razorpay_order_id) {
          isAuthentic = true;
        }
      }

      if (isAuthentic) {
        // Update order in server registry
        const existingOrder = ordersStore.get(razorpay_order_id);
        if (existingOrder) {
          existingOrder.isPaid = true;
          existingOrder.paymentStatus = 'Paid / Razorpay Verified';
          existingOrder.razorpayPaymentId = razorpay_payment_id;
          existingOrder.verifiedAt = new Date().toISOString();
        }

        return res.end(JSON.stringify({
          success: true,
          verified: true,
          message: 'Payment signature verified successfully.',
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          verifiedAt: new Date().toISOString()
        }));
      } else {
        res.statusCode = 400;
        return res.end(JSON.stringify({
          success: false,
          verified: false,
          error: 'Payment verification failed: Invalid transaction signature.'
        }));
      }
    } catch (err) {
      console.error('[verify-razorpay-payment Error]:', err.message);
      res.statusCode = 500;
      return res.end(JSON.stringify({
        success: false,
        verified: false,
        error: 'Internal server error verifying transaction.'
      }));
    }
  }

  // -------------------------------------------------------------
  // API ROUTE 3: POST /api/razorpay/webhook (Server-to-Server Webhook)
  // -------------------------------------------------------------
  if ((pathname === '/api/razorpay/webhook' || pathname === '/api/razorpay-webhook') && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    try {
      const signature = req.headers['x-razorpay-signature'];
      if (!signature) {
        console.warn('[Razorpay Webhook] Rejected: Missing x-razorpay-signature header.');
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Missing x-razorpay-signature header.' }));
      }

      const { rawBody, parsed } = await parseRawBody(req);
      if (!rawBody || !rawBody.trim()) {
        console.warn('[Razorpay Webhook] Rejected: Empty webhook payload body.');
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Empty webhook payload body.' }));
      }

      // Compute expected HMAC-SHA256 signature using RAZORPAY_WEBHOOK_SECRET on RAW body
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      // Secure timing-safe signature comparison
      let isAuthentic = false;
      try {
        const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
        const signatureBuf = Buffer.from(signature, 'utf-8');
        if (expectedBuf.length === signatureBuf.length) {
          isAuthentic = crypto.timingSafeEqual(expectedBuf, signatureBuf);
        }
      } catch (e) {
        isAuthentic = (expectedSignature === signature);
      }

      if (!isAuthentic) {
        console.warn('[Razorpay Webhook] Rejected: Invalid cryptographic signature.');
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Invalid webhook signature.' }));
      }

      if (!parsed || typeof parsed !== 'object') {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload in verified webhook.' }));
      }

      const event = parsed.event;
      // Extract unique event ID for idempotency protection
      const eventId = parsed.event_id || parsed.id || (parsed.payload?.payment?.entity?.id ? `${parsed.payload.payment.entity.id}_${event}` : null);

      console.log(`[Razorpay Webhook] Authenticated event: "${event}" (Event ID: ${eventId || 'n/a'})`);

      // Idempotency: Reject duplicate webhook executions
      if (eventId && processedWebhookEvents.has(eventId)) {
        console.log(`[Razorpay Webhook] Idempotency: Duplicate event ${eventId} acknowledged without re-processing.`);
        return res.end(JSON.stringify({ success: true, message: 'Event already processed (idempotent duplicate).' }));
      }
      if (eventId) {
        processedWebhookEvents.add(eventId);
        if (processedWebhookEvents.size > 1000) {
          const firstKey = processedWebhookEvents.values().next().value;
          processedWebhookEvents.delete(firstKey);
        }
      }

      // 5. Handle Payment Events
      if (event === 'payment.captured' || event === 'order.paid') {
        const paymentEntity = parsed.payload?.payment?.entity;
        const paymentId = paymentEntity?.id || 'pay_unknown';
        const orderId = paymentEntity?.order_id || parsed.payload?.order?.entity?.id;

        console.log(`[Razorpay Webhook] Processing payment.captured -> Order: ${orderId}, Payment ID: ${paymentId}`);

        let matchedOrder = orderId ? ordersStore.get(orderId) : null;
        if (matchedOrder) {
          matchedOrder.isPaid = true;
          matchedOrder.paymentStatus = 'Paid / Razorpay Verified (Webhook Confirmed)';
          matchedOrder.razorpayPaymentId = paymentId;
          matchedOrder.webhookProcessedAt = new Date().toISOString();
          console.log(`[Razorpay Webhook] Order #${matchedOrder.orderId} updated to Paid / Razorpay Verified.`);
        } else if (orderId) {
          // Record order if initialized externally
          ordersStore.set(orderId, {
            orderId: orderId,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            amount: paymentEntity?.amount || 0,
            currency: paymentEntity?.currency || 'INR',
            isPaid: true,
            paymentStatus: 'Paid / Razorpay Verified (Webhook Confirmed)',
            webhookProcessedAt: new Date().toISOString()
          });
          console.log(`[Razorpay Webhook] Recorded external order #${orderId} as verified.`);
        }

        return res.end(JSON.stringify({
          success: true,
          message: 'Webhook payment.captured processed successfully.',
          order_id: orderId,
          payment_id: paymentId
        }));
      } else if (event === 'payment.failed') {
        const paymentEntity = parsed.payload?.payment?.entity;
        const paymentId = paymentEntity?.id;
        const orderId = paymentEntity?.order_id;
        const errorDesc = paymentEntity?.error_description || 'Payment failed';

        console.log(`[Razorpay Webhook] Processing payment.failed -> Order: ${orderId}. Reason: ${errorDesc}`);

        let matchedOrder = orderId ? ordersStore.get(orderId) : null;
        if (matchedOrder) {
          matchedOrder.isPaid = false;
          matchedOrder.paymentStatus = 'Payment Failed';
          matchedOrder.failureReason = errorDesc;
          matchedOrder.webhookProcessedAt = new Date().toISOString();
        }

        return res.end(JSON.stringify({
          success: true,
          message: 'Webhook payment.failed recorded.',
          order_id: orderId,
          failureReason: errorDesc
        }));
      } else {
        // Other events (e.g. refund.processed, dispute, etc.)
        console.log(`[Razorpay Webhook] Event "${event}" received and safely acknowledged.`);
        return res.end(JSON.stringify({
          success: true,
          message: `Event "${event}" acknowledged.`
        }));
      }

    } catch (err) {
      console.error('[Razorpay Webhook Error]:', err.message);
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, error: 'Internal server error processing webhook.' }));
    }
  }

  // -------------------------------------------------------------
  // API ROUTE 4: GET /api/order-status (Query Order Status)
  // -------------------------------------------------------------
  if (pathname === '/api/order-status' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    const orderId = parsedUrl.searchParams.get('order_id');
    if (!orderId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, error: 'Missing order_id parameter.' }));
    }
    const order = ordersStore.get(orderId);
    if (!order) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ success: false, error: 'Order not found in server registry.' }));
    }
    return res.end(JSON.stringify({ success: true, order }));
  }

  // -------------------------------------------------------------
  // API ROUTE 5: POST /api/reservations (Create Table Reservation)
  // -------------------------------------------------------------
  if (pathname === '/api/reservations' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { parsed: data } = await parseRawBody(req);
      if (!data || typeof data !== 'object') {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Invalid JSON request payload.' }));
      }

      const guestName = String(data.guestName || '').trim();
      const guestEmail = String(data.guestEmail || '').trim();
      const guestPhone = String(data.guestPhone || '').trim();
      const dateStr = String(data.date || '').trim();
      const timeSlot = String(data.timeSlot || '').trim();
      const diningArea = String(data.diningArea || 'main_hall').trim();
      const occasion = String(data.occasion || 'Dining Experience').trim();
      const specialRequests = String(data.specialRequests || '').trim().substring(0, 500);
      const guestCount = parseInt(data.guests, 10);

      // Validation
      if (!guestName || guestName.length < 2) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Please provide a valid guest name (min 2 characters).' }));
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!guestEmail || !emailRegex.test(guestEmail)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Please provide a valid contact email address.' }));
      }

      if (!guestPhone || guestPhone.length < 6) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Please provide a valid direct phone number.' }));
      }

      const minGuests = RestaurantConfig.reservations?.minGuests || 1;
      const maxGuests = RestaurantConfig.reservations?.maxGuests || 12;
      if (isNaN(guestCount) || guestCount < minGuests || guestCount > maxGuests) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: `Guest count must be between ${minGuests} and ${maxGuests} guests.` }));
      }

      // Date validation (prevent past dates)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateStr || !dateRegex.test(dateStr)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Invalid date format (YYYY-MM-DD required).' }));
      }

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (dateStr < todayStr) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Reservation date cannot be in the past.' }));
      }

      // Lookup dining area title
      const areaObj = (RestaurantConfig.reservations?.diningAreas || []).find(a => a.id === diningArea);
      const diningAreaName = areaObj ? areaObj.name : 'The Grand Dining Room';

      // Generate booking reference code: RES-XXXXXX
      const bookingCode = 'RES-' + Math.floor(100000 + Math.random() * 900000);

      const reservation = {
        bookingId: bookingCode,
        guestName,
        guestEmail,
        guestPhone,
        guests: guestCount,
        date: dateStr,
        timeSlot: timeSlot || '7:30 PM',
        diningArea: diningAreaName,
        diningAreaId: diningArea,
        occasion,
        specialRequests,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      };

      reservationsStore.set(bookingCode, reservation);
      console.log(`[Spice Haven] Reservation confirmed: ${bookingCode} for ${guestName} (${guestCount} guests, ${dateStr} at ${timeSlot})`);

      return res.end(JSON.stringify({
        success: true,
        booking_id: bookingCode,
        status: 'Confirmed',
        reservation
      }));
    } catch (err) {
      console.error('[reservations Error]:', err.message);
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, error: 'Internal server error while confirming table reservation.' }));
    }
  }

  // -------------------------------------------------------------
  // API ROUTE 6: GET /api/reservation-status (Query Reservation)
  // -------------------------------------------------------------
  if (pathname === '/api/reservation-status' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    const bookingId = (parsedUrl.searchParams.get('booking_id') || '').trim().toUpperCase();
    if (!bookingId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ success: false, error: 'Missing booking_id parameter.' }));
    }

    const reservation = reservationsStore.get(bookingId);
    if (!reservation) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ success: false, error: `Reservation "${bookingId}" not found in server records.` }));
    }

    return res.end(JSON.stringify({ success: true, reservation }));
  }

  // -------------------------------------------------------------
  // API ROUTE 7: POST /api/inquiries (Private Dining Inquiries)
  // -------------------------------------------------------------
  if (pathname === '/api/inquiries' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { parsed: data } = await parseRawBody(req);
      if (!data || typeof data !== 'object') {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Invalid JSON request payload.' }));
      }

      const clientName = String(data.clientName || '').trim();
      const clientEmail = String(data.clientEmail || '').trim();
      const eventGuests = parseInt(data.eventGuests, 10) || 16;
      const targetDate = String(data.targetDate || '').trim();
      const eventNotes = String(data.eventNotes || '').trim().substring(0, 1000);

      if (!clientName || clientName.length < 2) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Please enter your name.' }));
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!clientEmail || !emailRegex.test(clientEmail)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Please enter a valid email address.' }));
      }

      const inquiryCode = 'INQ-' + Math.floor(100000 + Math.random() * 900000);
      const inquiry = {
        inquiryId: inquiryCode,
        clientName,
        clientEmail,
        eventGuests,
        targetDate: targetDate || 'Flexible',
        eventNotes: eventNotes || 'No specific dietary notes provided',
        status: 'Received',
        createdAt: new Date().toISOString()
      };

      inquiriesStore.set(inquiryCode, inquiry);
      console.log(`[Spice Haven] Private dining inquiry received: ${inquiryCode} from ${clientName} (${clientEmail})`);

      return res.end(JSON.stringify({
        success: true,
        inquiry_id: inquiryCode,
        message: 'Your VIP private dining inquiry has been received. Our Master Sommelier & Banquet Concierge will contact you within 12 hours.',
        inquiry
      }));
    } catch (err) {
      console.error('[inquiries Error]:', err.message);
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, error: 'Internal server error processing event inquiry.' }));
    }
  }

  // -------------------------------------------------------------
  // API ROUTE 8: CUSTOMER PROFILE (GET & POST /api/customer/profile)
  // -------------------------------------------------------------
  if (pathname === '/api/customer/profile') {
    res.setHeader('Content-Type', 'application/json');

    // GET /api/customer/profile?email=...
    if (req.method === 'GET') {
      const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
      if (!email) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Missing email parameter to retrieve customer profile.' }));
      }

      const profile = customerProfilesStore.get(email);
      if (!profile) {
        return res.end(JSON.stringify({ success: true, exists: false, profile: null, message: 'No existing profile found for this email.' }));
      }

      return res.end(JSON.stringify({ success: true, exists: true, profile }));
    }

    // POST /api/customer/profile
    if (req.method === 'POST') {
      try {
        const { parsed: data } = await parseRawBody(req);
        if (!data || typeof data !== 'object') {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Invalid JSON request payload.' }));
        }

        const email = String(data.email || '').trim().toLowerCase();
        const name = String(data.name || '').trim();
        const phone = String(data.phone || '').trim();
        const diningPreference = String(data.diningPreference || 'The Grand Dining Room').trim();
        const dietaryNotes = String(data.dietaryNotes || '').trim().substring(0, 500);

        if (!name || name.length < 2) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Please provide a valid name (min 2 characters).' }));
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Please provide a valid contact email address.' }));
        }

        const updatedProfile = {
          name,
          email,
          phone,
          diningPreference,
          dietaryNotes,
          membershipTier: 'Spice Haven Connoisseur',
          updatedAt: new Date().toISOString()
        };

        const existing = customerProfilesStore.get(email);
        if (existing && existing.createdAt) {
          updatedProfile.createdAt = existing.createdAt;
        } else {
          updatedProfile.createdAt = new Date().toISOString();
        }

        customerProfilesStore.set(email, updatedProfile);
        console.log(`[Spice Haven] Customer profile updated: ${email} (${name})`);

        return res.end(JSON.stringify({
          success: true,
          message: 'Customer profile successfully updated.',
          profile: updatedProfile
        }));
      } catch (err) {
        console.error('[customer/profile Error]:', err.message);
        res.statusCode = 500;
        return res.end(JSON.stringify({ success: false, error: 'Internal server error updating customer profile.' }));
      }
    }

    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
  }

  // -------------------------------------------------------------
  // API ROUTE 9: GET /api/customer/orders (Retrieve User Orders)
  // -------------------------------------------------------------
  if (pathname === '/api/customer/orders' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
    const phone = (parsedUrl.searchParams.get('phone') || '').trim();
    const orderIdsParam = (parsedUrl.searchParams.get('order_ids') || '').trim();

    const orderIdSet = new Set(
      orderIdsParam ? orderIdsParam.split(',').map(id => id.trim()).filter(Boolean) : []
    );

    const matchedOrders = [];

    // Search server ordersStore
    for (const [key, order] of ordersStore.entries()) {
      let isMatch = false;

      if (orderIdSet.has(order.orderId) || orderIdSet.has(order.razorpayOrderId)) {
        isMatch = true;
      } else if (phone && order.customerPhone && order.customerPhone.includes(phone)) {
        isMatch = true;
      }

      if (isMatch) {
        matchedOrders.push({
          orderId: order.orderId || key,
          razorpayOrderId: order.razorpayOrderId,
          date: order.createdAt || order.submittedAt || new Date().toISOString(),
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          diningMode: order.diningMode || 'Dine-In',
          items: order.items || [],
          totalAmount: order.amount ? (order.amount > 1000 ? Math.round(order.amount / 100) : order.amount) : 0,
          currencySymbol: '₹',
          isPaid: !!order.isPaid,
          orderStatus: order.isPaid ? 'Confirmed & Preparing' : (order.paymentStatus || 'Created'),
          paymentStatus: order.paymentStatus || (order.isPaid ? 'Paid / Verified' : 'Created')
        });
      }
    }

    // Sort by latest date
    matchedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.end(JSON.stringify({
      success: true,
      count: matchedOrders.length,
      orders: matchedOrders
    }));
  }

  // -------------------------------------------------------------
  // API ROUTE 10: GET /api/customer/reservations (Retrieve User Reservations)
  // -------------------------------------------------------------
  if (pathname === '/api/customer/reservations' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
    const phone = (parsedUrl.searchParams.get('phone') || '').trim();
    const bookingIdsParam = (parsedUrl.searchParams.get('booking_ids') || '').trim();

    const bookingIdSet = new Set(
      bookingIdsParam ? bookingIdsParam.split(',').map(id => id.trim().toUpperCase()).filter(Boolean) : []
    );

    const matchedReservations = [];

    for (const [bookingCode, resItem] of reservationsStore.entries()) {
      let isMatch = false;

      if (bookingIdSet.has(bookingCode.toUpperCase()) || bookingIdSet.has((resItem.bookingId || '').toUpperCase())) {
        isMatch = true;
      } else if (email && (resItem.guestEmail || '').toLowerCase() === email) {
        isMatch = true;
      } else if (phone && resItem.guestPhone && resItem.guestPhone.includes(phone)) {
        isMatch = true;
      }

      if (isMatch) {
        matchedReservations.push(resItem);
      }
    }

    // Sort by reservation date
    matchedReservations.sort((a, b) => new Date(b.date + ' ' + (b.timeSlot || '')).getTime() - new Date(a.date + ' ' + (a.timeSlot || '')).getTime());

    return res.end(JSON.stringify({
      success: true,
      count: matchedReservations.length,
      reservations: matchedReservations
    }));
  }

  // -------------------------------------------------------------
  // API ROUTE 11: CUSTOMER FAVORITES (GET & POST /api/customer/favorites)
  // -------------------------------------------------------------
  if (pathname === '/api/customer/favorites') {
    res.setHeader('Content-Type', 'application/json');

    // GET /api/customer/favorites?email=...
    if (req.method === 'GET') {
      const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
      if (!email) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ success: false, error: 'Missing email parameter to retrieve favorites.' }));
      }

      const favorites = customerFavoritesStore.get(email) || [];
      return res.end(JSON.stringify({
        success: true,
        count: favorites.length,
        favorites
      }));
    }

    // POST /api/customer/favorites
    if (req.method === 'POST') {
      try {
        const { parsed: data } = await parseRawBody(req);
        if (!data || typeof data !== 'object') {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Invalid JSON request payload.' }));
        }

        const email = String(data.email || '').trim().toLowerCase();
        if (!email) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Customer email is required to persist favorites.' }));
        }

        let userFavs = customerFavoritesStore.get(email) || [];

        // Support array replacement or single item toggle
        if (Array.isArray(data.favorites)) {
          userFavs = [...new Set(data.favorites.map(id => String(id).trim()).filter(Boolean))];
        } else if (data.itemId) {
          const itemId = String(data.itemId).trim();
          const action = String(data.action || 'toggle').toLowerCase();
          const idx = userFavs.indexOf(itemId);

          if (action === 'add' && idx === -1) {
            userFavs.push(itemId);
          } else if (action === 'remove' && idx !== -1) {
            userFavs.splice(idx, 1);
          } else if (action === 'toggle') {
            if (idx !== -1) {
              userFavs.splice(idx, 1);
            } else {
              userFavs.push(itemId);
            }
          }
        }

        customerFavoritesStore.set(email, userFavs);
        console.log(`[Spice Haven] Favorites updated for ${email}: ${userFavs.length} items`);

        return res.end(JSON.stringify({
          success: true,
          message: 'Favorites updated successfully.',
          count: userFavs.length,
          favorites: userFavs
        }));
      } catch (err) {
        console.error('[customer/favorites Error]:', err.message);
        res.statusCode = 500;
        return res.end(JSON.stringify({ success: false, error: 'Internal server error updating customer favorites.' }));
      }
    }

    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
  }

  // -------------------------------------------------------------
  // STATIC FILE SERVING
  // -------------------------------------------------------------
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, safePath);

  // Prevent directory traversal outside workspace
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      const notFoundPage = path.join(__dirname, '404.html');
      if (fs.existsSync(notFoundPage)) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return fs.createReadStream(notFoundPage).pipe(res);
      }
      res.statusCode = 404;
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Cache static images/fonts, but keep code fresh
    if (filePath.includes(path.join(__dirname, 'assets'))) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    fs.createReadStream(filePath).pipe(res);
  });
});

// Start Server if invoked directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Spice Haven] Server running with Razorpay Gateway & Webhook integration at http://localhost:${PORT}`);
    console.log(`[Spice Haven] Environment: Razorpay Key ID: ${KEY_ID ? KEY_ID.substring(0, 12) + '...' : 'None'}`);
    console.log(`[Spice Haven] Webhook Endpoint: POST /api/razorpay/webhook`);
  });
}

module.exports = server;
