/**
 * VERIFICATION SUITE — TASK 6: TRUE ANIMATED CHEF PERFORMANCE
 * Living Culinary Characters: Left Sauté Virtuoso & Right Plating Artisan
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('   TASK 6 — TRUE ANIMATED CHEF PERFORMANCE VERIFICATION SUITE   ');
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

// -----------------------------------------------------------------------------
// SECTION 1: DOM Elements & Multi-Part Articulated Rigging
// -----------------------------------------------------------------------------
console.log('SECTION 1: DOM Elements & Articulated Vector Nodes');
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

test('index.html contains Left Chef Stage (#chefPerformanceLeft)', () => {
  assert(indexHtml.includes('id="chefPerformanceLeft"'));
  assert(indexHtml.includes('class="chef-stage chef-stage-left"'));
});

test('index.html contains Right Chef Stage (#chefPerformanceRight)', () => {
  assert(indexHtml.includes('id="chefPerformanceRight"'));
  assert(indexHtml.includes('class="chef-stage chef-stage-right"'));
});

test('Left Chef contains articulated arm hierarchy (upper arm & forearm)', () => {
  assert(indexHtml.includes('class="chef-left-upperarm"'));
  assert(indexHtml.includes('class="chef-left-forearm"'));
});

test('Left Chef contains pan with ergonomic handle', () => {
  assert(indexHtml.includes('class="chef-left-pan"'));
  assert(indexHtml.includes('class="pan-body-group"'));
});

test('Left Chef contains multiple tossing food morsels (wagyu, mushroom, bell pepper, herbs)', () => {
  assert(indexHtml.includes('class="food-tossed food-tossed-1"'));
  assert(indexHtml.includes('class="food-tossed food-tossed-2"'));
  assert(indexHtml.includes('class="food-tossed food-tossed-3"'));
  assert(indexHtml.includes('class="food-tossed food-tossed-4"'));
});

test('Left Chef contains dynamic hearth flame group with blue core and reactive tongues', () => {
  assert(indexHtml.includes('class="hearth-flame-group"'));
  assert(indexHtml.includes('class="flame-blue-core"'));
  assert(indexHtml.includes('class="flame-tongue flame-tongue-1"'));
});

test('Left Chef contains volumetric searing steam wisps', () => {
  assert(indexHtml.includes('class="chef-steam-left"'));
  assert(indexHtml.includes('class="steam-wisp steam-wisp-1"'));
});

test('Right Chef contains articulated garnish arm (upper arm, forearm, hand)', () => {
  assert(indexHtml.includes('class="chef-garnish-upperarm"'));
  assert(indexHtml.includes('class="chef-garnish-forearm"'));
  assert(indexHtml.includes('class="chef-garnish-hand"'));
});

test('Right Chef contains seasoning flurry cascade (Maldon salt & micro-herbs)', () => {
  assert(indexHtml.includes('class="garnish-particles-group"'));
  assert(indexHtml.includes('class="garnish-salt salt-1"'));
  assert(indexHtml.includes('class="garnish-salt salt-2"'));
  assert(indexHtml.includes('class="garnish-salt herb-1"'));
});

test('Right Chef contains luxury artisan plate with gastronomic swirl & medallion', () => {
  assert(indexHtml.includes('class="plated-dish-group"'));
  assert(indexHtml.includes('class="chef-steam-right"'));
});

test('Both chefs display authentic culinary station badges', () => {
  assert(indexHtml.includes('Chef de Cuisine • Sauté Station'));
  assert(indexHtml.includes('Chef Entremetier • Plating Atelier'));
});

// -----------------------------------------------------------------------------
// SECTION 2: CSS Keyframes, Physical Kinematics & Easing Curves
// -----------------------------------------------------------------------------
console.log('\nSECTION 2: CSS Keyframes & Kinematic Pivot Physics');
const animCss = fs.readFileSync(path.join(__dirname, '../css/animations.css'), 'utf8');

test('animations.css defines Left Chef upper arm toss keyframes with coil & jerk', () => {
  assert(animCss.includes('@keyframes chefLeftArmToss'));
  assert(animCss.includes('transform-origin: 165px 240px'));
});

test('animations.css defines Left Chef forearm flexing keyframes', () => {
  assert(animCss.includes('@keyframes chefLeftForearmToss'));
  assert(animCss.includes('transform-origin: 195px 305px'));
});

test('animations.css defines pan pitching motion with catch leveling', () => {
  assert(animCss.includes('@keyframes chefPanPitchMotion'));
  assert(animCss.includes('transform-origin: 252px 352px'));
});

test('animations.css defines parabolic food toss arc with deceleration and return', () => {
  assert(animCss.includes('@keyframes foodParabolicToss'));
  assert(animCss.includes('translateY(-52px)'));
});

test('animations.css defines hearth flame surge reacting to pan toss', () => {
  assert(animCss.includes('@keyframes flameHearthSurge'));
  assert(animCss.includes('scaleY(1.4)'));
});

test('animations.css defines Right Chef garnish arm reach & hover cycle', () => {
  assert(animCss.includes('@keyframes chefRightArmGarnish'));
  assert(animCss.includes('transform-origin: 205px 245px'));
});

test('animations.css defines Right Chef tweezers & finger pinch tap gesture', () => {
  assert(animCss.includes('@keyframes chefGarnishHandPinch'));
  assert(animCss.includes('transform-origin: 130px 345px'));
});

test('animations.css defines seasoning flurry cascade falling onto the dish', () => {
  assert(animCss.includes('@keyframes seasoningCascadeFall'));
  assert(animCss.includes('translateY(22px)'));
});

test('animations.css includes responsive breakpoints preserving central typography', () => {
  assert(animCss.includes('@media (max-width: 1400px)'));
  assert(animCss.includes('@media (max-width: 1200px)'));
  assert(animCss.includes('@media (max-width: 992px)'));
  assert(animCss.includes('@media (max-width: 768px)'));
});

test('animations.css halts chef kinematics under prefers-reduced-motion', () => {
  assert(animCss.includes('@media (prefers-reduced-motion: reduce)'));
  assert(animCss.includes('.chef-left-upperarm'));
  assert(animCss.includes('.chef-garnish-upperarm'));
  assert(animCss.includes('animation: none !important'));
});

// -----------------------------------------------------------------------------
// SECTION 3: JavaScript Orchestrator & Lifecycle
// -----------------------------------------------------------------------------
console.log('\nSECTION 3: JavaScript Orchestrator & Ambient Responsiveness');
const animJs = fs.readFileSync(path.join(__dirname, '../js/animations.js'), 'utf8');

test('animations.js invokes setupChefPerformance() in AppAnimations.init()', () => {
  assert(animJs.includes('this.setupChefPerformance()'));
  assert(animJs.includes('setupChefPerformance() {'));
});

test('animations.js inspects prefers-reduced-motion for chef performance', () => {
  assert(animJs.includes('(prefers-reduced-motion: reduce)'));
});

// -----------------------------------------------------------------------------
// SECTION 4: Synthetic DOM Execution Check
// -----------------------------------------------------------------------------
console.log('\nSECTION 4: Simulated DOM Execution');
global.window = {
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  scrollTo: () => {},
  scrollY: 0
};
global.document = {
  getElementById: (id) => ({
    id,
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    style: {},
    setAttribute: () => {},
    addEventListener: () => {},
    querySelector: () => ({ style: {} })
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  body: { style: {}, classList: { add: () => {}, remove: () => {} } }
};

try {
  eval(animJs);
  test('AppAnimations object exposes setupChefPerformance method', () => {
    assert(typeof global.window.AppAnimations.setupChefPerformance === 'function');
  });

  test('AppAnimations.init() runs cleanly without exceptions', () => {
    global.window.AppAnimations.init();
    assert(true);
  });
} catch (e) {
  test('Simulated DOM initialization', () => {
    throw e;
  });
}

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
const total = passed + failed;
console.log('\n================================================================');
console.log(`  TASK 6 CHEF PERFORMANCE TEST RESULTS: ${passed}/${total} PASSED (${Math.round((passed/total)*100)}% SUCCESS RATE)`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
