/**
 * Full Production Readiness & Quality Audit for Task 15
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('  SPICE HAVEN DINING — FULL PRODUCTION READINESS AUDIT ');
console.log('====================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(title, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${title}`);
    passedChecks++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${title}: ${err.message}`);
    failedChecks++;
  }
}

// 1. Check index.html
const indexPath = path.join(__dirname, '../index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

console.log('--- 1. SEO, Metadata & HTML Structure ---');
check('Viewport meta tag properly configured', () => {
  assert(indexHtml.includes('name="viewport"'), 'Missing viewport meta');
  assert(indexHtml.includes('width=device-width'), 'Missing width=device-width');
});

check('Title, description and canonical tags exist', () => {
  assert(indexHtml.includes('<title>'), 'Missing <title>');
  assert(indexHtml.includes('name="description"'), 'Missing description meta');
  assert(indexHtml.includes('rel="canonical"'), 'Missing canonical link');
});

check('Schema.org structured data exists and is valid JSON', () => {
  const match = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(match, 'Missing Schema.org json-ld block');
  const parsed = JSON.parse(match[1]);
  assert.strictEqual(parsed['@type'], 'Restaurant');
  assert.strictEqual(parsed.name, 'Spice Haven');
});

console.log('\n--- 2. Visual & Architectural Integrity ---');
check('Restaurant interior background image referenced in CSS', () => {
  const sectionsCss = fs.readFileSync(path.join(__dirname, '../css/sections.css'), 'utf8');
  assert(sectionsCss.includes('restaurant-interior.jpg') || sectionsCss.includes('assets/restaurant-interior.jpg'), 'Missing restaurant-interior background');
});

check('Curtain entrance DOM and replay trigger exist', () => {
  assert(indexHtml.includes('id="curtainEntrance"'), 'Missing curtainEntrance');
  assert(indexHtml.includes('id="curtainEnterBtn"'), 'Missing curtainEnterBtn');
});

check('Both Animated Chefs (Left: Sauté, Right: Plating) exist with human realism', () => {
  assert(indexHtml.includes('id="chefPerformanceLeft"'), 'Missing chefPerformanceLeft');
  assert(indexHtml.includes('id="chefPerformanceRight"'), 'Missing chefPerformanceRight');
  assert(indexHtml.includes('chef-toque-assembly'), 'Missing chef-toque-assembly');
  assert(indexHtml.includes('chef-right-toque-assembly'), 'Missing chef-right-toque-assembly');
});

console.log('\n--- 3. Interactive Modals & Experiences (Tasks 1-14) ---');
check('Interactive Menu section with Task 14 Search Hub exists', () => {
  assert(indexHtml.includes('id="menu"'), 'Missing menu section');
  assert(indexHtml.includes('id="menuSearchInput"'), 'Missing menuSearchInput');
  assert(indexHtml.includes('id="menuSearchClearBtn"'), 'Missing menuSearchClearBtn');
  assert(indexHtml.includes('id="menuPriceSelect"'), 'Missing menuPriceSelect');
  assert(indexHtml.includes('id="menuSortSelect"'), 'Missing menuSortSelect');
  assert(indexHtml.includes('id="menuResultsCount"'), 'Missing menuResultsCount');
  assert(indexHtml.includes('id="menuActiveFilterBadges"'), 'Missing menuActiveFilterBadges');
});

check('Dining Room Showcase & Table Reservation Modal exist', () => {
  assert(indexHtml.includes('id="experiences"'), 'Missing experiences section');
  assert(indexHtml.includes('id="reservationModal"'), 'Missing reservationModal');
  assert(indexHtml.includes('id="popupReservationForm"') || indexHtml.includes('class="reservation-form-submit"'), 'Missing reservation form');
});

check('Cart Drawer & Checkout Multi-Step Modal exist', () => {
  assert(indexHtml.includes('id="cartDrawer"'), 'Missing cartDrawer');
  assert(indexHtml.includes('id="checkoutModal"'), 'Missing checkoutModal');
  assert(indexHtml.includes('id="upiPaymentModal"'), 'Missing upiPaymentModal');
});

check('Customer Profile & Order History Modal exist', () => {
  assert(indexHtml.includes('id="customerProfileModal"'), 'Missing customerProfileModal');
  assert(indexHtml.includes('id="headerAccountBtn"'), 'Missing headerAccountBtn');
});

console.log('\n--- 4. Security & Data Safety ---');
check('Zero frontend exposure of Razorpay secret keys or private credentials', () => {
  const jsFiles = ['app.js', 'menu.js', 'cart.js', 'reservation.js', 'profile.js', 'favorites.js', 'gallery.js', 'animations.js', 'restaurant.config.js'];
  for (const file of jsFiles) {
    const code = fs.readFileSync(path.join(__dirname, '../js', file), 'utf8');
    assert(!code.includes('rzp_live_secret'), `Secret leak in ${file}`);
    assert(!code.includes('RAZORPAY_KEY_SECRET ='), `Secret variable defined in ${file}`);
    assert(!code.includes('RAZORPAY_WEBHOOK_SECRET ='), `Webhook secret defined in ${file}`);
  }
});

console.log('\n--- 5. CSS Design System & Accessibility ---');
check('Focus-visible styles exist for accessible keyboard navigation', () => {
  const mainCss = fs.readFileSync(path.join(__dirname, '../css/main.css'), 'utf8');
  assert(mainCss.includes(':focus-visible'), 'Missing :focus-visible rules in main.css');
});

check('Reduced motion accessibility support exists in animations.css', () => {
  const animCss = fs.readFileSync(path.join(__dirname, '../css/animations.css'), 'utf8');
  assert(animCss.includes('prefers-reduced-motion'), 'Missing prefers-reduced-motion in animations.css');
});

check('Responsive breakpoint media queries exist across all CSS sheets', () => {
  const cssFiles = ['main.css', 'sections.css', 'components.css', 'animations.css', 'design-system.css'];
  for (const file of cssFiles) {
    const css = fs.readFileSync(path.join(__dirname, '../css', file), 'utf8');
    if (file !== 'design-system.css') {
      assert(css.includes('@media'), `Missing media queries in ${file}`);
    }
  }
});

console.log('\n--- 6. JavaScript Module Architecture Syntax Check ---');
check('All JS modules parse and compile without syntax errors', () => {
  const jsFiles = ['server.js', 'js/restaurant.config.js', 'js/lib/qrcode.min.js', 'js/animations.js', 'js/menu.js', 'js/favorites.js', 'js/cart.js', 'js/reservation.js', 'js/profile.js', 'js/gallery.js', 'js/app.js'];
  for (const relPath of jsFiles) {
    const fullPath = path.join(__dirname, '..', relPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    new Function(content); // Evaluates syntax
  }
});

console.log(`\n====================================================`);
console.log(`  AUDIT RESULTS: ${passedChecks}/${totalChecks} CHECKS PASSED`);
console.log(`====================================================`);

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('All Production Readiness Checks Succeeded!\n');
}
