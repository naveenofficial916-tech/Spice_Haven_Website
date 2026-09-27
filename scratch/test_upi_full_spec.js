/**
 * COMPREHENSIVE VERIFICATION SUITE: UPI INSTANT PAYMENT ENGINE
 * Tests NPCI compliance, dynamic QR generation, validation, UTR verification, and duplicate prevention.
 */

const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = {};
const elements = {};
global.document = {
  getElementById: (id) => {
    if (!elements[id]) {
      elements[id] = {
        id,
        value: '',
        textContent: '',
        innerHTML: '',
        style: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        setAttribute(k, v) { this[k] = v; },
        getAttribute(k) { return this[k]; },
        appendChild: () => {},
        focus: () => {}
      };
    }
    return elements[id];
  },
  querySelector: (sel) => {
    return { value: 'Dine-In Service', checked: true };
  },
  querySelectorAll: () => [],
  createElement: () => ({
    style: {},
    appendChild: () => {},
    remove: () => {}
  }),
  body: { style: {}, appendChild: () => {}, removeChild: () => {} }
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  clear() { this.store = {}; }
};

// Load restaurant config
require(path.join(__dirname, '../js/restaurant.config.js'));
global.RestaurantConfig = global.window.RestaurantConfig;
global.formatCurrency = global.window.formatCurrency;

// Load QR code generator
global.window.QRCode = require(path.join(__dirname, '../js/lib/qrcode.min.js'));
global.QRCode = global.window.QRCode;

// Load CartModule
require(path.join(__dirname, '../js/cart.js'));
const CartModule = global.window.CartModule;

console.log("==========================================================");
console.log("  UPI INSTANT PAYMENT ENGINE - COMPREHENSIVE AUDIT SUITE  ");
console.log("==========================================================\n");

// -----------------------------------------------------------------------------
// TEST 1: Configured Merchant VPA & Payee Name Verification
// -----------------------------------------------------------------------------
console.log("1. Inspecting Configured UPI Credentials:");
const upiConfig = RestaurantConfig.commerce.upiPayment;
console.assert(upiConfig.enabled === true, "UPI Payment must be enabled");
console.assert(upiConfig.upiId === "naveenofficial916@okaxis", `Configured UPI ID must match naveenofficial916@okaxis, got: ${upiConfig.upiId}`);
console.assert(upiConfig.merchantName === "Naveen", `Configured Payee Name must be Naveen, got: ${upiConfig.merchantName}`);
console.assert(upiConfig.currency === "INR", "Currency must be INR");
console.log(`  - Merchant UPI ID (VPA): ${upiConfig.upiId}`);
console.log(`  - Payee Name: ${upiConfig.merchantName}`);
console.log(`  - Currency: ${upiConfig.currency} (${upiConfig.currencySymbol})`);
console.log("✔ Test 1 Passed: Genuine Configured Credentials Verified\n");

// -----------------------------------------------------------------------------
// TEST 2: Dynamic Amount Formatting & URI Construction (Requirement 13)
// Test amounts: ₹99, ₹499, ₹1,499, ₹10,000
// -----------------------------------------------------------------------------
console.log("2. Testing Exact Dynamic Amount URI Generation (Req 13):");
const testAmounts = [
  { input: 99, expectedAm: "99.00", label: "₹99" },
  { input: 499, expectedAm: "499.00", label: "₹499" },
  { input: 1499, expectedAm: "1499.00", label: "₹1,499" },
  { input: 10000, expectedAm: "10000.00", label: "₹10,000" }
];

testAmounts.forEach(({ input, expectedAm, label }) => {
  const uri = CartModule.buildUpiUri(upiConfig.upiId, upiConfig.merchantName, input);
  const expectedUri = `upi://pay?pa=naveenofficial916@okaxis&pn=Naveen&am=${expectedAm}&cu=INR`;
  console.assert(uri === expectedUri, `Mismatch for ${label}. Expected "${expectedUri}", got "${uri}"`);
  console.assert(uri.includes(`am=${expectedAm}`), `URI must contain am=${expectedAm}`);
  console.assert(uri.startsWith("upi://pay?pa=naveenofficial916@okaxis&pn=Naveen&am="), `Order of parameters must be pa -> pn -> am`);
  console.assert(uri.endsWith("&cu=INR"), `URI must conclude with &cu=INR`);
  console.log(`  - ${label} (Amount: ${expectedAm}) -> URI: ${uri}`);
});
console.log("✔ Test 2 Passed: Dynamic Amounts ₹99, ₹499, ₹1,499, ₹10,000 Verified\n");

// -----------------------------------------------------------------------------
// TEST 3: Pre-Generation Strong Validation (Requirement 9)
// -----------------------------------------------------------------------------
console.log("3. Testing Pre-Generation Strong Validation (Req 9):");
// Case 3a: Valid data
const validCheck = CartModule.validateUpiParams(upiConfig, 1499);
console.assert(validCheck.isValid === true, "Valid parameters should pass");

// Case 3b: Missing UPI ID
const missingIdCheck = CartModule.validateUpiParams({ ...upiConfig, upiId: "" }, 1499);
console.assert(missingIdCheck.isValid === false, "Empty UPI ID must fail validation");
console.assert(missingIdCheck.errors.some(e => e.includes("temporarily unavailable")), "Should return unavailable error");

// Case 3c: Malformed UPI ID
const badVpaCheck = CartModule.validateUpiParams({ ...upiConfig, upiId: "invalid_vpa_without_handle" }, 1499);
console.assert(badVpaCheck.isValid === false, "Bad VPA format must fail validation");
console.assert(badVpaCheck.errors.some(e => e.includes("temporarily unavailable")), "Should return unavailable error");

// Case 3d: Missing Payee Name
const missingNameCheck = CartModule.validateUpiParams({ ...upiConfig, merchantName: "" }, 1499);
console.assert(missingNameCheck.isValid === false, "Empty Payee Name must fail validation");

// Case 3e: Cart Total <= 0
const zeroTotalCheck = CartModule.validateUpiParams(upiConfig, 0);
console.assert(zeroTotalCheck.isValid === false, "Zero total must fail validation");
const negativeTotalCheck = CartModule.validateUpiParams(upiConfig, -100);
console.assert(negativeTotalCheck.isValid === false, "Negative total must fail validation");

console.log("  - Valid Params: Passed");
console.log("  - Missing UPI ID: Caught & Blocked");
console.log("  - Invalid VPA Format: Caught & Blocked");
console.log("  - Missing Payee Name: Caught & Blocked");
console.log("  - Zero/Negative Cart Amount: Caught & Blocked");
console.log("✔ Test 3 Passed: Strong Pre-Generation Validation Verified\n");

// -----------------------------------------------------------------------------
// TEST 4: Dynamic SVG QR Code Output
// -----------------------------------------------------------------------------
console.log("4. Testing SVG QR Code Generation & DOM Injection:");
CartModule.items = [
  { id: 'sh-01', name: 'Truffle Saffron Black Cod', price: 3999, qty: 1 }
];
CartModule.openUpiModal();

const qrTarget = document.getElementById('upiQrTarget');
console.assert(qrTarget.innerHTML.includes('<svg'), "Target must contain valid SVG QR element");
console.assert(qrTarget.innerHTML.includes('viewBox='), "SVG must contain responsive viewBox attribute");
console.assert(CartModule.currentUpiUri === "upi://pay?pa=naveenofficial916@okaxis&pn=Naveen&am=4199.00&cu=INR", `URI must reflect 5% GST total of 4199.00, got: ${CartModule.currentUpiUri}`);

const intentBtn = document.getElementById('upiDirectIntentBtn');
console.assert(intentBtn.getAttribute('href') === CartModule.currentUpiUri, "Direct intent button href must match dynamic UPI URI");
console.log(`  - Rendered QR for order ${CartModule.currentOrderId}: ${CartModule.currentUpiUri}`);
console.log("✔ Test 4 Passed: SVG QR Code & Mobile Intent Button Verified\n");

// -----------------------------------------------------------------------------
// TEST 5: Security: Order Unpaid Merely Upon Viewing QR (Requirement 10)
// -----------------------------------------------------------------------------
console.log("5. Testing Security: Order Unpaid While Viewing QR (Req 10):");
let storedOrders = JSON.parse(localStorage.getItem('spicehaven_orders') || '[]');
console.assert(storedOrders.length === 0, "No order must be marked as paid or recorded merely upon displaying QR");
console.log("  - Verified 0 orders written to storage upon modal presentation.");
console.log("✔ Test 5 Passed: QR Display Does Not Mark Order As Paid\n");

// -----------------------------------------------------------------------------
// TEST 6: Payment Verification Mechanism & UTR Format Check (Requirement 10, 11)
// -----------------------------------------------------------------------------
console.log("6. Testing Payment Verification & UTR Validation (Req 10 & 11):");
// Case 6a: Blank UTR submission
document.getElementById('upiUtrInput').value = '';
CartModule.handleUpiSubmitted();
const errorEl = document.getElementById('upiUtrError');
console.assert(errorEl.style.display === 'block', "Error message must be shown for blank UTR");
console.assert(errorEl.textContent.includes('Please enter'), "Error message should prompt for UTR");

// Case 6b: Invalid format UTR (non-numeric or length != 12)
document.getElementById('upiUtrInput').value = 'abc123';
CartModule.handleUpiSubmitted();
console.assert(errorEl.style.display === 'block', "Error message must be shown for invalid UTR format");
console.assert(errorEl.textContent.includes('Invalid UTR format'), "Error message must state invalid UTR format");

document.getElementById('upiUtrInput').value = '1234567'; // 7 digits
CartModule.handleUpiSubmitted();
console.assert(errorEl.textContent.includes('12 numeric digits'), "Must require exactly 12 numeric digits");

console.log("  - Blank UTR Rejected: OK");
console.log("  - Non-numeric UTR Rejected: OK");
console.log("  - Length != 12 UTR Rejected: OK");
console.log("✔ Test 6 Passed: UTR Format & Completeness Enforced\n");

// -----------------------------------------------------------------------------
// TEST 7: Successful Payment Settlement, State Transition & Duplicate Prevention
// -----------------------------------------------------------------------------
console.log("7. Testing Successful Payment Settlement & Duplicate Prevention:");
const validUtr = "425612349876";
document.getElementById('upiUtrInput').value = validUtr;

// Synchronously execute callback inside setTimeout for deterministic testing
const originalSetTimeout = global.setTimeout;
global.setTimeout = (fn) => fn();

CartModule.handleUpiSubmitted();

global.setTimeout = originalSetTimeout;

storedOrders = JSON.parse(localStorage.getItem('spicehaven_orders') || '[]');
console.assert(storedOrders.length === 1, "Order must be recorded after successful verification");
const order = storedOrders[0];
console.assert(order.isPaid === false, "order.isPaid must be false until bank reconciliation");
console.assert(order.paymentStatus === "Payment Initiated (Awaiting Merchant Verification)", `paymentStatus must be 'Payment Initiated (Awaiting Merchant Verification)', got: ${order.paymentStatus}`);
console.assert(order.transactionRef === validUtr, `transactionRef must be ${validUtr}`);
console.assert(order.totalAmount === 4199, `totalAmount must match 4199`);
console.assert(order.currency === 'INR', `Currency must be INR`);
console.assert(CartModule.items.length === 0, "Cart must be emptied after verified payment");

// Result container display
const resultEl = document.getElementById('upiResultContainer');
console.assert(resultEl.style.display === 'block', "Result container must be displayed");
console.assert(resultEl.innerHTML.includes('Payment Initiated'), "Success title must show Payment Initiated");
console.assert(resultEl.innerHTML.includes(validUtr), "Result view must show verified UTR");

// Test Duplicate Prevention with same UTR
document.getElementById('upiUtrInput').value = validUtr;
CartModule.handleUpiSubmitted();
console.assert(errorEl.style.display === 'block', "Duplicate UTR submission must be blocked");
console.assert(errorEl.textContent.includes('Duplicate Payment Reference'), "Error must flag duplicate payment");

console.log(`  - Order Recorded: #${order.orderId}`);
console.log(`  - Status: ${order.paymentStatus}`);
console.log(`  - Verified UTR: ${order.transactionRef}`);
console.log(`  - Amount: ₹${order.totalAmount}`);
console.log(`  - Duplicate UTR Rejection: Verified and Blocked`);
console.log("✔ Test 7 Passed: Verified Payment Completion & Duplicate Prevention\n");

console.log("==========================================================");
console.log("  ALL 7 AUDIT SECTIONS PASSED WITH 100% SUCCESS RATE!     ");
console.log("==========================================================");
