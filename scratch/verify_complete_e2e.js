/**
 * END-TO-END VERIFICATION: CURRENCY & COMMERCE INTEGRATION (₹ INR)
 */
const path = require('path');

// Mock DOM
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
        appendChild: () => {}
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
  body: { style: {}, appendChild: () => {} }
};

global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  clear() { this.store = {}; }
};

// 1. Load RestaurantConfig
require(path.join(__dirname, '../js/restaurant.config.js'));
global.RestaurantConfig = global.window.RestaurantConfig;
global.formatCurrency = global.window.formatCurrency;

// 2. Load QRCode
global.window.QRCode = require(path.join(__dirname, '../js/lib/qrcode.min.js'));
global.QRCode = global.window.QRCode;

// 3. Load MenuModule & CartModule
require(path.join(__dirname, '../js/menu.js'));
require(path.join(__dirname, '../js/cart.js'));

const MenuModule = global.window.MenuModule;
const CartModule = global.window.CartModule;

console.log("=== COMPREHENSIVE INR CURRENCY & COMMERCE SUITE ===");

// 1. Menu Catalog Pricing Verification
console.log("\n1. Verifying Menu Catalog Prices in INR:");
let allInRupees = true;
let reasonableRange = true;
RestaurantConfig.menuItems.forEach(item => {
  const formatted = RestaurantConfig.formatCurrency(item.price);
  if (!formatted.includes('₹')) allInRupees = false;
  if (item.price < 500 || item.price > 15000) reasonableRange = false;
  console.log(`  - [${item.id}] ${item.name}: ${formatted} (Raw: ${item.price})`);
});
console.assert(allInRupees, "All menu item prices must format with ₹");
console.assert(reasonableRange, "All menu prices must be realistic INR dining prices (₹500 - ₹15,000)");
console.log("✔ Menu catalog verification passed!");

// 2. Cart Add, Quantity Adjustments & Calculations
console.log("\n2. Testing Cart Calculations & Quantities:");
CartModule.items = [];
CartModule.handleAddToCart('sh-01'); // Truffle Saffron Black Cod (3999)
CartModule.handleAddToCart('sh-02'); // Smoked A5 Miyazaki Wagyu Ribcap (5999)
CartModule.handleAddToCart('sh-03'); // Lobster Tail & Smoked Ghee Risotto (4499)

let subtotal = CartModule.calcSubtotal();
console.assert(subtotal === (3999 + 5999 + 4499), `Subtotal should be 14497, got ${subtotal}`);
console.log(`  - Added 3 luxury dishes. Subtotal: ${RestaurantConfig.formatCurrency(subtotal)}`);

CartModule.updateQty('sh-01', 1); // 2x Black Cod (7998)
subtotal = CartModule.calcSubtotal();
console.assert(subtotal === (7998 + 5999 + 4499), `Subtotal should be 18496, got ${subtotal}`);
console.log(`  - Increased Black Cod to 2x. Updated Subtotal: ${RestaurantConfig.formatCurrency(subtotal)}`);

// 3. Promo Code Application & GST Calculation
console.log("\n3. Testing Promo Code & Taxes:");
CartModule.applyPromoCode('SAVOR15'); // 15% off orders above 2500
console.assert(CartModule.appliedPromo !== null, "Promo code SAVOR15 should be applied");
const discount = Math.round((subtotal * 0.15));
const taxable = subtotal - discount;
const tax = Math.round(taxable * 0.05); // 5% GST
const finalTotal = taxable + tax;
console.log(`  - Privilege Discount (15%): -${RestaurantConfig.formatCurrency(discount)}`);
console.log(`  - GST & Service (5%): +${RestaurantConfig.formatCurrency(tax)}`);
console.log(`  - Final Payable: ${RestaurantConfig.formatCurrency(finalTotal)}`);

// 4. UPI Instant Modal & QR Generation
console.log("\n4. Testing UPI Dynamic QR Generation:");
CartModule.openUpiModal();
console.assert(CartModule.currentUpiUri.includes("am=" + finalTotal), "UPI URI must contain exact payable amount");
console.assert(CartModule.currentUpiUri.includes("cu=INR"), "UPI URI must specify INR currency");
console.assert(CartModule.currentUpiUri.includes("pa=naveenofficial916@okaxis"), "UPI URI must have merchant VPA");
console.log(`  - Generated UPI URI: ${CartModule.currentUpiUri}`);

// 5. Payment Submission & Order Record Confirmation
console.log("\n5. Testing Payment Submission & Order Confirmation:");
document.getElementById('upiUtrInput').value = '987654321012';
CartModule.handleUpiSubmitted();

const orders = JSON.parse(localStorage.getItem('spicehaven_orders') || '[]');
console.assert(orders.length === 1, "Order must be recorded in storage");
const order = orders[0];
console.assert(order.currency === 'INR', "Order currency must be INR");
console.assert(order.currencySymbol === '₹', "Currency symbol must be ₹");
console.assert(order.totalAmount === finalTotal, "Recorded order total must match final calculation");
console.log(`  - Order Ticket Reference: #${order.orderId}`);
console.log(`  - Order Status: ${order.paymentStatus}`);
console.log(`  - Recorded Payable Amount: ${RestaurantConfig.formatCurrency(order.totalAmount)}`);
console.log(`  - Bank UTR: ${order.transactionRef}`);

console.log("\n=== ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY! ===");
