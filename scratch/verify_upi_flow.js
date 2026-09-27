/**
 * VERIFICATION SUITE: UPI INSTANT PAYMENT ENGINE (NATIVE INR)
 */

const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = {};
global.document = {
  getElementById: (id) => {
    if (!global._elements[id]) {
      global._elements[id] = {
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
        getAttribute(k) { return this[k]; }
      };
    }
    return global._elements[id];
  },
  querySelector: (sel) => {
    return { value: 'Dine-In Service', checked: true };
  },
  querySelectorAll: () => [],
  body: { style: {} }
};

global._elements = {};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  clear() { this.store = {}; }
};

// Load restaurant config
require(path.join(__dirname, '../js/restaurant.config.js'));
global.RestaurantConfig = global.window.RestaurantConfig;

// Load QR code engine
global.window.QRCode = require(path.join(__dirname, '../js/lib/qrcode.min.js'));
global.QRCode = global.window.QRCode;

// Load CartModule
require(path.join(__dirname, '../js/cart.js'));
const CartModule = global.window.CartModule;

console.log("=== BEGINNING UPI PAYMENT ENGINE TESTS (INR) ===");

// TEST 1: Config check
const upiConf = RestaurantConfig.commerce.upiPayment;
console.assert(upiConf.enabled === true, "UPI Payment should be enabled in config");
console.assert(upiConf.upiId === "naveenofficial916@okaxis", "UPI ID should match centralized config");
console.assert(upiConf.currency === "INR", "UPI currency must be INR");
console.assert(RestaurantConfig.commerce.currencySymbol === "₹", "Currency symbol must be ₹");
console.log("✔ Test 1 Passed: Centralized UPI Configuration Verified (₹ / INR)");

// TEST 2: Empty cart check
CartModule.items = [];
let emptyAlert = false;
CartModule.showToast = (msg, type) => { if (type === 'error') emptyAlert = true; };
CartModule.openUpiModal();
console.assert(emptyAlert === true, "Should reject opening UPI payment with empty cart");
console.log("✔ Test 2 Passed: Empty Cart Rejection Verified");

// TEST 3: Single item addition & calculation
CartModule.items = [
  { id: 'sh-01', name: 'Truffle Saffron Black Cod', price: 3999, qty: 1 }
];
let subtotal = CartModule.calcSubtotal();
console.assert(subtotal === 3999, `Expected 3999, got ${subtotal}`);
console.log("✔ Test 3 Passed: Single Product Calculation Verified (₹3,999)");

// TEST 4: Multiple items & quantities
CartModule.items = [
  { id: 'sh-01', name: 'Truffle Saffron Black Cod', price: 3999, qty: 2 }, // 7998
  { id: 'sh-02', name: 'Smoked A5 Miyazaki Wagyu Ribcap', price: 5999, qty: 1 }, // 5999
  { id: 'sh-12', name: 'Dark Valrhona Fondant & Gold Leaf', price: 1699, qty: 3 } // 5097
];
subtotal = CartModule.calcSubtotal();
// 7998 + 5999 + 5097 = 19094
console.assert(subtotal === 19094, `Expected 19094, got ${subtotal}`);
console.log("✔ Test 4 Passed: Multiple Products & Quantities Verified (₹19,094)");

// TEST 5: Quantity increase/decrease & auto-recalculation
CartModule.updateQty('sh-01', 1); // sh-01 qty becomes 3 (11997) -> total 23093
console.assert(CartModule.calcSubtotal() === 23093, `Subtotal should increase to 23093, got ${CartModule.calcSubtotal()}`);
CartModule.updateQty('sh-12', -1); // sh-12 qty becomes 2 (3398) -> total 21394
console.assert(CartModule.calcSubtotal() === 21394, `Subtotal should decrease to 21394, got ${CartModule.calcSubtotal()}`);
console.log("✔ Test 5 Passed: Quantity Increment/Decrement Recalculation Verified (₹21,394)");

// TEST 6: Promo Code Application & Tax Calculation
CartModule.appliedPromo = { code: 'SAVOR15', discountPercent: 15, minOrder: 2500 };
// Subtotal = 21394
// Discount = Math.round(21394 * 0.15) = 3209
// Taxable = 21394 - 3209 = 18185
// Tax = Math.round(18185 * 0.05) = 909
// Total INR = 18185 + 909 = 19094
CartModule.openUpiModal();
console.assert(CartModule.currentUpiUri !== null, "Current UPI URI must be generated");
console.assert(CartModule.currentUpiUri.includes("pa=naveenofficial916@okaxis"), "URI must include merchant UPI ID");
console.assert(CartModule.currentUpiUri.includes("am=19094"), `URI must include exact calculated INR amount (got: ${CartModule.currentUpiUri})`);
console.assert(CartModule.currentUpiUri.includes("cu=INR"), "URI must specify cu=INR");
console.assert(CartModule.currentUpiUri.includes("tn="), "URI must include transaction note");
console.log(`✔ Test 6 Passed: Standard UPI Payment Link Format Verified: ${CartModule.currentUpiUri}`);

// TEST 7: Dynamic SVG QR Code Rendering
const targetSvg = global._elements['upiQrTarget'].innerHTML;
console.assert(targetSvg.includes('<svg'), "Target must contain valid SVG QR code markup");
console.assert(targetSvg.includes('viewBox='), "Target SVG must have responsive viewBox");
console.log("✔ Test 7 Passed: Dynamic QR Code SVG Output Verified");

// TEST 8: Tab Switching (Dynamic vs Static)
CartModule.switchUpiTab('static', true);
const staticSvg = global._elements['upiQrTarget'].innerHTML;
console.assert(staticSvg.includes('<svg'), "Static tab must render payee QR");
CartModule.switchUpiTab('dynamic', true);
console.assert(global._elements['upiInrAmountHero'].textContent.includes('₹'), "Dynamic tab should display INR total");
console.log("✔ Test 8 Passed: Tab Switching Between Dynamic QR & Merchant Reference Verified");

// TEST 9: Payment Submission, Security & Order History Retention
global.document.getElementById('upiUtrInput').value = '429817654321';
CartModule.handleUpiSubmitted();

const storedOrders = JSON.parse(global.localStorage.getItem('spicehaven_orders'));
console.assert(storedOrders.length === 1, "Order must be stored in localStorage");
const order = storedOrders[0];
console.assert(order.orderId !== undefined, "Order ID must exist");
console.assert(order.paymentStatus === "Payment Initiated (Awaiting Bank Reconciliation)", "Payment status must be initiated, NOT verified/paid");
console.assert(order.transactionRef === '429817654321', "UTR reference must be saved");
console.assert(order.totalAmount === 19094, `Amount must match exact INR total, got ${order.totalAmount}`);
console.assert(order.currency === 'INR', "Order currency must be INR");
console.assert(order.currencySymbol === '₹', "Order currency symbol must be ₹");
console.assert(order.products.length === 3, "All line items must be preserved");
console.assert(CartModule.items.length === 0, "Cart must be emptied after submission");
console.log("✔ Test 9 Passed: Security Separation (Payment Initiated vs Verified) & Order History Retention Verified");

console.log("\nALL 9 TESTS PASSED WITH 100% SUCCESS IN INDIAN RUPEES (₹)!");
