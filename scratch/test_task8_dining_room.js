/**
 * SPICE HAVEN - TASK 8: IMMERSIVE DINING ROOM EXPERIENCE TEST SUITE
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('   SPICE HAVEN TASK 8 — IMMERSIVE DINING ROOM TEST SUITE        ');
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

const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const sectionsCss = fs.readFileSync(path.join(__dirname, '../css/sections.css'), 'utf8');
const reservationJs = fs.readFileSync(path.join(__dirname, '../js/reservation.js'), 'utf8');

// -------------------------------------------------------------
// SECTION 1: DOM Structure & Immersive Content
// -------------------------------------------------------------
console.log('SECTION 1: Dining Room Section DOM Architecture');

runTest('index.html contains #experiences with .restaurant-bg-section', () => {
  assert(indexHtml.includes('id="experiences" class="section restaurant-bg-section"') ||
         indexHtml.includes('class="section restaurant-bg-section" id="experiences"'),
         'Missing #experiences with .restaurant-bg-section');
});

runTest('Dining Room heading is authentic and refined', () => {
  assert(indexHtml.includes('The Spice Haven Dining Room'), 'Missing "The Spice Haven Dining Room" title');
  assert(indexHtml.includes('Atmosphere & Architecture'), 'Missing section tag');
});

runTest('Contains immersive showcase panel (.dining-showcase-panel)', () => {
  assert(indexHtml.includes('class="dining-showcase-panel reveal"'), 'Missing .dining-showcase-panel');
  assert(indexHtml.includes('dining-showcase-title'), 'Missing dining showcase title');
  assert(indexHtml.includes('dining-showcase-text'), 'Missing dining showcase text');
});

runTest('Ambience description highlights real interior details', () => {
  assert(indexHtml.includes('brick vaulted arches'), 'Must mention brick vaulted arches');
  assert(indexHtml.includes('crystal chandeliers'), 'Must mention crystal chandeliers');
  assert(indexHtml.includes('white florals') || indexHtml.includes('floral'), 'Must mention floral canopy');
  assert(indexHtml.includes('mahogany tables') || indexHtml.includes('tables'), 'Must mention dining tables');
});

runTest('Contains 4 architectural ambience feature items', () => {
  assert(indexHtml.includes('Vaulted Brick Arches'), 'Missing Vaulted Brick Arches feature');
  assert(indexHtml.includes('Floral Canopy'), 'Missing Floral Canopy feature');
  assert(indexHtml.includes('Warm Amber Glow'), 'Missing Warm Amber Glow feature');
  assert(indexHtml.includes('Curated Table Settings'), 'Missing Curated Table Settings feature');
});

// -------------------------------------------------------------
// SECTION 2: CTAs & Reservation Integration
// -------------------------------------------------------------
console.log('\nSECTION 2: Dual CTAs & Reservation Flow Integration');

runTest('Contains "Reserve a Table" CTA button', () => {
  assert(indexHtml.includes('id="diningReserveBtn"'), 'Missing #diningReserveBtn');
  assert(indexHtml.includes('Reserve a Table'), 'Missing "Reserve a Table" button text');
});

runTest('Reserve a Table button connects to existing reservation modal via .trigger-reservation-modal', () => {
  const btnMatch = indexHtml.match(/<button[^>]*id="diningReserveBtn"[^>]*>/);
  assert(btnMatch, 'Could not find #diningReserveBtn element');
  assert(btnMatch[0].includes('trigger-reservation-modal'), 'Button must include class "trigger-reservation-modal"');
});

runTest('ReservationModule binds to .trigger-reservation-modal', () => {
  assert(reservationJs.includes("document.querySelectorAll('.trigger-reservation-modal')"),
         'reservation.js must bind to .trigger-reservation-modal');
  assert(reservationJs.includes("this.openModal()"), 'Trigger must invoke openModal()');
});

runTest('Contains "Explore Menu" CTA scrolling to #menu', () => {
  assert(indexHtml.includes('href="#menu"'), 'Missing link to #menu');
  assert(indexHtml.includes('Explore Menu'), 'Missing "Explore Menu" label');
});

runTest('Contains all 4 architectural experience sanctuary cards with triggers', () => {
  assert(indexHtml.includes('The Grand Dining Hall'), 'Missing The Grand Dining Hall card');
  assert(indexHtml.includes('Private Wine Cellar'), 'Missing Private Wine Cellar card');
  assert(indexHtml.includes("Chef's Tasting Counter"), 'Missing Chef Tasting Counter card');
  assert(indexHtml.includes('Glasshouse Terrace'), 'Missing Glasshouse Terrace card');
});

// -------------------------------------------------------------
// SECTION 3: CSS & Responsive Styling
// -------------------------------------------------------------
console.log('\nSECTION 3: CSS Design System & Responsiveness');

runTest('sections.css styles #experiences.restaurant-bg-section', () => {
  assert(sectionsCss.includes('#experiences.restaurant-bg-section'), 'Missing #experiences.restaurant-bg-section rule');
});

runTest('sections.css defines .dining-showcase-panel with frosted glassmorphism', () => {
  assert(sectionsCss.includes('.dining-showcase-panel'), 'Missing .dining-showcase-panel');
  assert(sectionsCss.includes('backdrop-filter: blur'), 'Missing backdrop-filter blur for glassmorphism');
});

runTest('sections.css defines .dining-ambience-features grid', () => {
  assert(sectionsCss.includes('.dining-ambience-features'), 'Missing .dining-ambience-features');
  assert(sectionsCss.includes('.ambience-feature-item'), 'Missing .ambience-feature-item');
  assert(sectionsCss.includes('.ambience-feature-icon'), 'Missing .ambience-feature-icon');
});

runTest('sections.css defines .dining-cta-group with hover micro-interactions', () => {
  assert(sectionsCss.includes('.dining-cta-group'), 'Missing .dining-cta-group');
  assert(sectionsCss.includes('.experience-card-action'), 'Missing .experience-card-action');
});

runTest('sections.css includes responsive rules for tablet (<=1024px)', () => {
  assert(sectionsCss.includes('@media (max-width: 1024px)'), 'Missing 1024px media query');
  assert(sectionsCss.includes('.dining-ambience-features'), 'Missing tablet ambience features rule');
});

runTest('sections.css includes responsive rules for mobile (<=768px)', () => {
  assert(sectionsCss.includes('@media (max-width: 768px)'), 'Missing 768px media query');
  assert(sectionsCss.includes('.dining-showcase-panel'), 'Missing mobile dining showcase panel rule');
  assert(sectionsCss.includes('.dining-cta-group'), 'Missing mobile dining CTA group rule');
});

// -------------------------------------------------------------
// SECTION 4: Background Asset & Contrast Integrity
// -------------------------------------------------------------
console.log('\nSECTION 4: Restaurant Background Asset & Visibility');

runTest('assets/restaurant-interior.jpg exists and is authentic image', () => {
  const assetPath = path.join(__dirname, '../assets/restaurant-interior.jpg');
  assert(fs.existsSync(assetPath), 'restaurant-interior.jpg does not exist');
  const stats = fs.statSync(assetPath);
  assert(stats.size > 200000, `Asset size ${stats.size} is too small`);
});

runTest('sections.css references restaurant-interior.jpg behind background sections', () => {
  assert(sectionsCss.includes('restaurant-interior.jpg'), 'sections.css must reference restaurant-interior.jpg');
});

runTest('Dual-gradient vignette preserves background visibility without opaque blockage', () => {
  assert(sectionsCss.includes('radial-gradient'), 'Must use radial-gradient vignette');
  assert(sectionsCss.includes('rgba(12, 10, 8, 0.42)'), 'Central overlay must be luminous (<=0.45 alpha)');
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`  TASK 8 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}% SUCCESS RATE)`);
console.log('================================================================\n');

process.exit(passedTests === totalTests ? 0 : 1);
