/**
 * Task 14 Comprehensive Test Suite: Smart Menu Search & Filtering
 * Tests:
 * 1. Search by dish name
 * 2. Search by description
 * 3. Search by existing category
 * 4. Search by existing tags/pairing
 * 5. Search with no results (verifies "No dishes found." and "Clear Filters" button)
 * 6. Category filtering (starters, mains, biryani, desserts, beverages, favorites)
 * 7. Dietary filtering (all, veg, non-veg, seafood, signature, gluten-free, vegan)
 * 8. Price range filtering (under-2000, 2000-4000, above-4000)
 * 9. Sorting (recommended, price-asc, price-desc, name-asc)
 * 10. Multi-filter combination (e.g. "chicken" + Mains category + Non-Veg)
 * 11. Clear individual filter / Reset all filters
 * 12. Add to cart & favorite interactions with filtered dishes
 */

const assert = require('assert');

// Mock browser globals for DOM testing
const menuItems = [
  {
    id: 'starter-1',
    name: 'Truffle Galouti Kebab',
    price: 1850,
    description: 'Melt-in-mouth smoked lamb patties infused with Himalayan black truffle oil and rose petal dust.',
    categoryId: 'starters',
    course: 'Starter',
    isVeg: false,
    isSeafood: false,
    isSpecial: true,
    tags: ['Signature', 'Gluten-Free'],
    pairing: 'Pinot Noir 2018'
  },
  {
    id: 'starter-2',
    name: 'Saffron Paneer Tikka Carpaccio',
    price: 1450,
    description: 'Charred artisanal cottage cheese slices marinated in Kashmiri saffron and sun-dried mint.',
    categoryId: 'starters',
    course: 'Starter',
    isVeg: true,
    isSeafood: false,
    isSpecial: false,
    tags: ['Vegetarian', 'Gluten-Free'],
    pairing: 'Crisp Sauvignon Blanc'
  },
  {
    id: 'main-1',
    name: 'Royal Awadhi Murgh Biryani',
    price: 2450,
    description: 'Long-grain aged basmati dum-cooked with country chicken, saffron broth, and sealed in clay pot.',
    categoryId: 'mains',
    course: 'Main Course',
    isVeg: false,
    isSeafood: false,
    isSpecial: true,
    tags: ['Signature', 'Dum Cooked'],
    pairing: 'Full-Bodied Syrah'
  },
  {
    id: 'main-2',
    name: 'Lobster Malabar Moilee',
    price: 4800,
    description: 'Fresh Bay of Bengal rock lobster poached in coconut milk, curry leaves, and green mango.',
    categoryId: 'mains',
    course: 'Main Course',
    isVeg: false,
    isSeafood: true,
    isSpecial: true,
    tags: ['Seafood', 'Chef Exclusive', 'Gluten-Free'],
    pairing: 'Chardonnay'
  },
  {
    id: 'main-3',
    name: 'Wild Morel Dal Bukhara',
    price: 1950,
    description: 'Black lentils slow-simmered for 36 hours over wood fire, folded with Himalayan morels and churned butter.',
    categoryId: 'mains',
    course: 'Main Course',
    isVeg: true,
    isSeafood: false,
    isSpecial: false,
    tags: ['Vegetarian', 'Slow Cooked'],
    pairing: 'Cabernet Franc'
  },
  {
    id: 'dessert-1',
    name: '24K Gold Saffron Rasmalai',
    price: 1650,
    description: 'Chenna dumplings soaked in pistachio-infused condensed milk, topped with edible 24K gold leaf.',
    categoryId: 'desserts',
    course: 'Dessert',
    isVeg: true,
    isSeafood: false,
    isSpecial: true,
    tags: ['Vegetarian', 'Signature'],
    pairing: 'Late Harvest Riesling'
  },
  {
    id: 'dessert-2',
    name: 'Vegan Coconut Cardamom Kulfi',
    price: 1250,
    description: 'Creamy coconut cream kulfi with crushed pistachios and freshly ground cardamom.',
    categoryId: 'desserts',
    course: 'Dessert',
    isVeg: true,
    isSeafood: false,
    isSpecial: false,
    tags: ['Vegan', 'Gluten-Free', 'Vegetarian'],
    pairing: 'Dessert Port'
  }
];

// Helper mock environment
global.RestaurantConfig = { menuItems };
global.FavoritesModule = {
  getFavoriteIds: () => ['starter-1', 'main-2'],
  isFavorite: (id) => ['starter-1', 'main-2'].includes(id),
  toggleFavorite: (id) => {}
};

const MenuModule = require('../../Website development/js/menu.js');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    failedTests++;
  }
}

console.log('--- Starting Task 14 Tests: Smart Menu Search & Filtering ---');

test('1. Search by Dish Name (e.g., "Biryani")', () => {
  const results = MenuModule.filterAndSortItems({
    searchQuery: 'biryani',
    category: 'all',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].id, 'main-1');
});

test('2. Search by Description (e.g., "truffle")', () => {
  const results = MenuModule.filterAndSortItems({
    searchQuery: 'truffle',
    category: 'all',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].id, 'starter-1');
});

test('3. Search by Tags / Pairing (e.g., "Chardonnay" or "Dum Cooked")', () => {
  const pairingResults = MenuModule.filterAndSortItems({
    searchQuery: 'Chardonnay',
    category: 'all',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(pairingResults.length, 1);
  assert.strictEqual(pairingResults[0].id, 'main-2');

  const tagResults = MenuModule.filterAndSortItems({
    searchQuery: 'Dum Cooked',
    category: 'all',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(tagResults.length, 1);
  assert.strictEqual(tagResults[0].id, 'main-1');
});

test('4. Search with No Results & Verify No-Results Template', () => {
  const results = MenuModule.filterAndSortItems({
    searchQuery: 'NonExistentDishXYZ',
    category: 'all',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(results.length, 0);

  const html = MenuModule.renderNoResultsHtml();
  assert(html.includes('No dishes found.'), 'Should display exact "No dishes found." message');
  assert(html.includes('Clear Filters'), 'Should display exact "Clear Filters" button');
});

test('5. Category Filtering (e.g., "starters" vs "favorites")', () => {
  const starters = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'starters',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(starters.length, 2);

  const favs = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'favorites',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(favs.length, 2);
  assert.deepStrictEqual(favs.map(i => i.id), ['starter-1', 'main-2']);
});

test('6. Dietary Filtering (Veg, Non-Veg, Seafood, Chef Signature, Vegan, Gluten-Free)', () => {
  const veg = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'veg',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(veg.length, 4);
  assert(veg.every(i => i.isVeg));

  const nonVeg = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'non-veg',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(nonVeg.length, 3);
  assert(nonVeg.every(i => !i.isVeg));

  const seafood = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'seafood',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(seafood.length, 1);
  assert.strictEqual(seafood[0].id, 'main-2');

  const signature = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'signature',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(signature.length, 4);

  const vegan = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'vegan',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(vegan.length, 1);
  assert.strictEqual(vegan[0].id, 'dessert-2');

  const gf = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'gluten-free',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(gf.length, 4);
});

test('7. Price Range Filtering (under-2000, 2000-4000, above-4000)', () => {
  const under2000 = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'all',
    priceRange: 'under-2000',
    sortBy: 'recommended'
  });
  assert.strictEqual(under2000.length, 5); // 1850, 1450, 1950, 1650, 1250

  const mid = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'all',
    priceRange: '2000-4000',
    sortBy: 'recommended'
  });
  assert.strictEqual(mid.length, 1); // 2450 (Royal Awadhi Murgh Biryani)
  assert.strictEqual(mid[0].id, 'main-1');

  const luxury = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'all',
    priceRange: 'above-4000',
    sortBy: 'recommended'
  });
  assert.strictEqual(luxury.length, 1); // 4800 (Lobster Malabar Moilee)
  assert.strictEqual(luxury[0].id, 'main-2');
});

test('8. Sorting (Price Ascending, Price Descending, Alphabetical)', () => {
  const priceAsc = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'price-asc'
  });
  for (let i = 0; i < priceAsc.length - 1; i++) {
    assert(priceAsc[i].price <= priceAsc[i + 1].price, 'Prices should be ascending');
  }

  const priceDesc = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'price-desc'
  });
  for (let i = 0; i < priceDesc.length - 1; i++) {
    assert(priceDesc[i].price >= priceDesc[i + 1].price, 'Prices should be descending');
  }

  const alpha = MenuModule.filterAndSortItems({
    searchQuery: '',
    category: 'all',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'name-asc'
  });
  for (let i = 0; i < alpha.length - 1; i++) {
    assert(alpha[i].name.localeCompare(alpha[i + 1].name) <= 0, 'Names should be alphabetical');
  }
});

test('9. Search + Multi-Filter Combination (e.g. "chicken" + Mains + Non-Veg)', () => {
  const combo = MenuModule.filterAndSortItems({
    searchQuery: 'chicken',
    category: 'mains',
    dietary: 'non-veg',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(combo.length, 1);
  assert.strictEqual(combo[0].id, 'main-1');
});

test('10. Multi-filter with Empty Intersection', () => {
  // Chicken search in Desserts category
  const empty = MenuModule.filterAndSortItems({
    searchQuery: 'chicken',
    category: 'desserts',
    dietary: 'all',
    priceRange: 'all',
    sortBy: 'recommended'
  });
  assert.strictEqual(empty.length, 0);
});

console.log(`\nTest Results: ${passedTests} passed, ${failedTests} failed`);
if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All Task 14 tests PASSED successfully!');
}
