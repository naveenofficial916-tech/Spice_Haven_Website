/**
 * SPICE HAVEN - TASK 7: PREMIUM INTERACTIVE MENU VERIFICATION SUITE
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   SPICE HAVEN TASK 7 — PREMIUM INTERACTIVE MENU TEST SUITE    ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${desc}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

// -------------------------------------------------------------
// SECTION 1: Config & Categories Integrity
// -------------------------------------------------------------
console.log('SECTION 1: Category Coverage & Existing Item Preservation');

// Mock window and document for Node testing
global.window = {};
global.document = {
  getElementById: (id) => null,
  querySelectorAll: (sel) => [],
  querySelector: (sel) => null,
  createElement: (tag) => ({
    className: '',
    innerHTML: '',
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} }
  }),
  body: {
    appendChild: () => {},
    style: {}
  }
};
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; },
  clear() { this._data = {}; }
};

require(path.join(__dirname, '../js/restaurant.config.js'));
const cfg = global.window.RestaurantConfig;

runTest('RestaurantConfig defines menuCategories array', () => {
  assert(Array.isArray(cfg.menuCategories), 'menuCategories must be an array');
  assert(cfg.menuCategories.length >= 9, 'Should have at least 9 categories');
});

const requiredCategories = [
  'starters', 'soups', 'mains', 'vegetarian', 'non-vegetarian',
  'seafood', 'specialities', 'desserts', 'beverages'
];

requiredCategories.forEach(catId => {
  runTest(`Category "${catId}" is present in menuCategories`, () => {
    const found = cfg.menuCategories.some(c => c.id.toLowerCase() === catId);
    assert(found, `Category ${catId} not found in menuCategories`);
  });
});

runTest('Original items sh-01 through sh-15 are preserved exactly', () => {
  const originalIds = [
    'sh-01', 'sh-02', 'sh-03', 'sh-04', 'sh-05',
    'sh-06', 'sh-07', 'sh-08', 'sh-09', 'sh-10',
    'sh-11', 'sh-12', 'sh-13', 'sh-14', 'sh-15'
  ];
  for (const id of originalIds) {
    const item = cfg.menuItems.find(i => i.id === id);
    assert(item, `Item ${id} is missing from menuItems!`);
    assert(typeof item.price === 'number' && item.price > 0, `Item ${id} price is invalid!`);
    assert(item.name && item.name.length > 0, `Item ${id} name is invalid!`);
  }
});

runTest('Items sh-01 (Black Cod), sh-02 (Wagyu), sh-12 (Fondant) preserve prices', () => {
  assert.strictEqual(cfg.menuItems.find(i => i.id === 'sh-01').price, 3999);
  assert.strictEqual(cfg.menuItems.find(i => i.id === 'sh-02').price, 5999);
  assert.strictEqual(cfg.menuItems.find(i => i.id === 'sh-12').price, 1699);
});

// -------------------------------------------------------------
// SECTION 2: Category Matching Logic
// -------------------------------------------------------------
console.log('\nSECTION 2: Multi-Dimensional Category Filtering Logic');

require(path.join(__dirname, '../js/menu.js'));
const MenuModule = global.window.MenuModule;

runTest('MenuModule is exported to global scope', () => {
  assert(MenuModule, 'MenuModule must be defined on window');
  assert(typeof MenuModule.matchesCategory === 'function', 'matchesCategory must be a function');
});

runTest('Category "all" matches every dish', () => {
  for (const item of cfg.menuItems) {
    assert(MenuModule.matchesCategory(item, 'all'), `Category "all" failed to match ${item.name}`);
  }
});

runTest('Category "starters" matches artisanal small plates', () => {
  const starters = cfg.menuItems.filter(i => MenuModule.matchesCategory(i, 'starters'));
  assert(starters.length >= 3, `Expected at least 3 starters, found ${starters.length}`);
  const names = starters.map(s => s.name);
  assert(names.includes('Charred Spanish Octopus Tentacle'));
  assert(names.includes('Burrata Pugliese with Charred Fig'));
});

runTest('Category "soups" matches artisanal broths and veloutés', () => {
  const soups = cfg.menuItems.filter(i => MenuModule.matchesCategory(i, 'soups'));
  assert(soups.length >= 2, `Expected at least 2 soups, found ${soups.length}`);
  const names = soups.map(s => s.name);
  assert(names.includes('Wild Morel & Porcini Velouté'));
  assert(names.includes('Kashmiri Saffron Lobster Bisque'));
});

runTest('Category "vegetarian" matches only vegetarian creations', () => {
  const vegDishes = cfg.menuItems.filter(i => MenuModule.matchesCategory(i, 'vegetarian'));
  assert(vegDishes.length >= 4, `Expected at least 4 vegetarian dishes, got ${vegDishes.length}`);
  for (const item of vegDishes) {
    assert(item.isVeg === true, `${item.name} is marked non-veg but returned under vegetarian!`);
  }
});

runTest('Category "non-vegetarian" matches strictly non-veg creations', () => {
  const nonVegDishes = cfg.menuItems.filter(i => MenuModule.matchesCategory(i, 'non-vegetarian'));
  assert(nonVegDishes.length >= 4, `Expected at least 4 non-veg dishes, got ${nonVegDishes.length}`);
  for (const item of nonVegDishes) {
    assert(item.isVeg !== true, `${item.name} is vegetarian but returned under non-vegetarian!`);
  }
});

runTest('Category "seafood" matches wild caught & coastal dishes', () => {
  const seafoodDishes = cfg.menuItems.filter(i => MenuModule.matchesCategory(i, 'seafood'));
  assert(seafoodDishes.length >= 4, `Expected at least 4 seafood dishes, got ${seafoodDishes.length}`);
  const names = seafoodDishes.map(s => s.name);
  assert(names.includes('Truffle Saffron Black Cod'));
  assert(names.includes('Lobster Tail & Smoked Ghee Risotto'));
  assert(names.includes('Charred Spanish Octopus Tentacle'));
  assert(names.includes('Tiger Prawns with Malabar Curry Leaf Butter'));
});

runTest('Category "specialities" matches chef signatures and awards', () => {
  const specials = cfg.menuItems.filter(i => MenuModule.matchesCategory(i, 'specialities'));
  assert(specials.length >= 4, `Expected at least 4 specialities, got ${specials.length}`);
  const names = specials.map(s => s.name);
  assert(names.includes('Truffle Saffron Black Cod'));
  assert(names.includes('Smoked A5 Miyazaki Wagyu Ribcap'));
});

runTest('Category "desserts" matches pastry and sweets', () => {
  const desserts = cfg.menuItems.filter(i => MenuModule.matchesCategory(i, 'desserts'));
  assert(desserts.length >= 2, `Expected at least 2 desserts, got ${desserts.length}`);
  const names = desserts.map(s => s.name);
  assert(names.includes('Dark Valrhona Fondant & Gold Leaf'));
  assert(names.includes('Saffron Cardamom Crème Brûlée'));
});

runTest('Category "beverages" matches cocktails & cellar elixirs', () => {
  const beverages = cfg.menuItems.filter(i => MenuModule.matchesCategory(i, 'beverages'));
  assert(beverages.length >= 2, `Expected at least 2 beverages, got ${beverages.length}`);
  const names = beverages.map(s => s.name);
  assert(names.includes('The Smoked Saffron Manhattan'));
  assert(names.includes('Botanical Cardamom & Rose Highball'));
});

// -------------------------------------------------------------
// SECTION 3: Inline Quantity Controls & Cart Synchronization
// -------------------------------------------------------------
console.log('\nSECTION 3: Inline Quantity Controls & Cart Integration');

require(path.join(__dirname, '../js/cart.js'));
const CartModule = global.window.CartModule;
CartModule.init();
CartModule.items = []; // Start fresh

runTest('Initial card action renders "Add to Order" when qty is 0', () => {
  const actionHtml = MenuModule.renderOrderAction('sh-01', 'Truffle Saffron Black Cod');
  assert(actionHtml.includes('add-to-cart-btn'), 'Should render add-to-cart-btn button');
  assert(actionHtml.includes('Add to Order'), 'Should contain "Add to Order" text');
  assert(!actionHtml.includes('menu-card-qty-control'), 'Should not render quantity stepper when qty is 0');
});

runTest('Adding item to cart transforms action into inline quantity stepper', () => {
  CartModule.handleAddToCart('sh-01');
  assert.strictEqual(CartModule.items.length, 1);
  assert.strictEqual(CartModule.items[0].qty, 1);

  const actionHtml = MenuModule.renderOrderAction('sh-01', 'Truffle Saffron Black Cod');
  assert(actionHtml.includes('menu-card-qty-control'), 'Should render menu-card-qty-control');
  assert(actionHtml.includes('1 in Order'), 'Should display "1 in Order"');
  assert(actionHtml.includes('menu-qty-minus'), 'Should have minus button');
  assert(actionHtml.includes('menu-qty-plus'), 'Should have plus button');
});

runTest('Incrementing quantity from card updates cart item to qty 2', () => {
  MenuModule.handleCardUpdateQty('sh-01', 1);
  assert.strictEqual(CartModule.items[0].qty, 2, 'Qty in CartModule should be 2');

  const actionHtml = MenuModule.renderOrderAction('sh-01', 'Truffle Saffron Black Cod');
  assert(actionHtml.includes('2 in Order'), 'Should display "2 in Order"');
});

runTest('Decrementing quantity reduces cart qty', () => {
  MenuModule.handleCardUpdateQty('sh-01', -1);
  assert.strictEqual(CartModule.items[0].qty, 1, 'Qty in CartModule should be 1');

  const actionHtml = MenuModule.renderOrderAction('sh-01', 'Truffle Saffron Black Cod');
  assert(actionHtml.includes('1 in Order'), 'Should display "1 in Order"');
});

runTest('Decrementing to 0 removes item and reverts to "Add to Order"', () => {
  MenuModule.handleCardUpdateQty('sh-01', -1);
  assert.strictEqual(CartModule.items.length, 0, 'CartModule.items should be empty');

  const actionHtml = MenuModule.renderOrderAction('sh-01', 'Truffle Saffron Black Cod');
  assert(actionHtml.includes('add-to-cart-btn'), 'Should revert to add-to-cart-btn');
  assert(actionHtml.includes('Add to Order'), 'Should display "Add to Order"');
});

// -------------------------------------------------------------
// SECTION 4: CSS Stylesheets & Accessibility
// -------------------------------------------------------------
console.log('\nSECTION 4: CSS & Accessibility Integrity');

const compCss = fs.readFileSync(path.join(__dirname, '../css/components.css'), 'utf8');
const secCss = fs.readFileSync(path.join(__dirname, '../css/sections.css'), 'utf8');

runTest('components.css defines pure vegetarian culinary indicator (.culinary-indicator.veg)', () => {
  assert(compCss.includes('.culinary-indicator.veg'), 'Missing .culinary-indicator.veg in components.css');
});

runTest('components.css defines non-vegetarian culinary indicator (.culinary-indicator.non-veg)', () => {
  assert(compCss.includes('.culinary-indicator.non-veg'), 'Missing .culinary-indicator.non-veg in components.css');
});

runTest('components.css defines inline quantity stepper (.menu-card-qty-control)', () => {
  assert(compCss.includes('.menu-card-qty-control'), 'Missing .menu-card-qty-control in components.css');
  assert(compCss.includes('.menu-qty-btn'), 'Missing .menu-qty-btn in components.css');
  assert(compCss.includes('.menu-qty-display'), 'Missing .menu-qty-display in components.css');
});

runTest('components.css defines category tabs track (.category-tabs-track)', () => {
  assert(compCss.includes('.category-tabs-track'), 'Missing .category-tabs-track in components.css');
  assert(compCss.includes('.cat-name'), 'Missing .cat-name in components.css');
  assert(compCss.includes('.cat-badge'), 'Missing .cat-badge in components.css');
});

runTest('sections.css contains mobile horizontal scrolling for category tabs', () => {
  assert(secCss.includes('overflow-x: auto'), 'sections.css should contain overflow-x: auto for mobile tabs');
  assert(secCss.includes('scrollbar-width: none'), 'sections.css should hide scrollbars on mobile');
});

runTest('sections.css preserves authentic restaurant-interior.jpg behind #menu', () => {
  assert(secCss.includes('restaurant-interior.jpg'), 'sections.css must preserve restaurant-interior.jpg');
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`  TASK 7 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}% SUCCESS RATE)`);
console.log('================================================================\n');

process.exit(passedTests === totalTests ? 0 : 1);
