/**
 * VERIFICATION SUITE — CINEMATIC RED VELVET RESTAURANT ENTRANCE
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('   CINEMATIC RESTAURANT ENTRANCE VERIFICATION SUITE             ');
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

// 1. HTML Markup Inspection
console.log('SECTION 1: DOM Elements & Theatrical Structure');
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

test('index.html contains #curtainEntrance container', () => {
  assert(indexHtml.includes('id="curtainEntrance"'));
});

test('index.html contains .curtain-pelmet valance', () => {
  assert(indexHtml.includes('class="curtain-pelmet"'));
});

test('index.html contains left velvet panel (#curtainLeft)', () => {
  assert(indexHtml.includes('class="curtain-panel curtain-left"'));
});

test('index.html contains right velvet panel (#curtainRight)', () => {
  assert(indexHtml.includes('class="curtain-panel curtain-right"'));
});

test('index.html contains .curtain-content center card', () => {
  assert(indexHtml.includes('class="curtain-content"'));
});

test('index.html contains #curtainEnterBtn interaction trigger', () => {
  assert(indexHtml.includes('id="curtainEnterBtn"'));
  assert(indexHtml.includes('Enter Restaurant'));
});

test('index.html contains "Replay Entrance" action in footer', () => {
  assert(indexHtml.includes('AppAnimations.replayCurtain()'));
  assert(indexHtml.includes('Replay Entrance'));
});

// 2. CSS Styles & Velvet Physics
console.log('\nSECTION 2: Red Velvet Shader & Animation Physics');
const animCss = fs.readFileSync(path.join(__dirname, '../css/animations.css'), 'utf8');

test('animations.css defines #curtainEntrance with fixed viewport and z-index 99999', () => {
  assert(animCss.includes('#curtainEntrance'));
  assert(animCss.includes('z-index: 99999'));
  assert(animCss.includes('position: fixed'));
});

test('animations.css includes fluted fabric repeating gradient texture', () => {
  assert(animCss.includes('repeating-linear-gradient'));
  assert(animCss.includes('linear-gradient'));
});

test('animations.css defines cubic-bezier curtain parting transitions', () => {
  assert(animCss.includes('cubic-bezier(0.77, 0, 0.175, 1)'));
});

test('animations.css defines opening states for left and right curtains', () => {
  assert(animCss.includes('#curtainEntrance.opening .curtain-left'));
  assert(animCss.includes('#curtainEntrance.opening .curtain-right'));
});

test('animations.css includes prefers-reduced-motion accessibility rule', () => {
  assert(animCss.includes('@media (prefers-reduced-motion: reduce)'));
  assert(animCss.includes('#curtainEntrance {'));
});

test('animations.css includes mobile responsiveness breakpoints', () => {
  assert(animCss.includes('@media (max-width: 768px)'));
  assert(animCss.includes('.curtain-brand-title'));
});

// 3. JavaScript Orchestration & Logic
console.log('\nSECTION 3: JavaScript Orchestrator & State Flow');
const animJs = fs.readFileSync(path.join(__dirname, '../js/animations.js'), 'utf8');

test('animations.js contains setupCurtainEntrance() in init()', () => {
  assert(animJs.includes('this.setupCurtainEntrance()'));
  assert(animJs.includes('setupCurtainEntrance() {'));
});

test('animations.js respects prefers-reduced-motion in runtime script', () => {
  assert(animJs.includes("prefers-reduced-motion: reduce"));
});

test('animations.js manages sessionStorage clean state for entrance presentation', () => {
  assert(animJs.includes('sessionStorage.removeItem(\'spicehaven_entered\')'));
});

test('animations.js contains replayCurtain() for user re-triggering', () => {
  assert(animJs.includes('replayCurtain() {'));
});

// 4. Client Runtime Simulation
console.log('\nSECTION 4: Simulated DOM Execution');
global.window = {
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  scrollTo: () => {}
};
global.sessionStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = v; }
};
global.document = {
  querySelector: () => ({ classList: { add() {}, remove() {} } }),
  querySelectorAll: () => [],
  getElementById: (id) => {
    if (id === 'curtainEntrance') {
      return {
        style: {},
        classList: { add() {}, remove() {}, contains: () => false },
        setAttribute() {},
        addEventListener() {}
      };
    }
    if (id === 'curtainEnterBtn') {
      return { addEventListener() {} };
    }
    return null;
  },
  body: { style: {}, classList: { add() {}, remove() {} } }
};

require('../js/animations.js');

test('AppAnimations object exposes setupCurtainEntrance and replayCurtain', () => {
  const animations = global.window.AppAnimations || global.AppAnimations;
  assert(animations, 'AppAnimations should be defined');
  assert(typeof animations.setupCurtainEntrance === 'function');
  assert(typeof animations.replayCurtain === 'function');
});

test('Calling AppAnimations.init() initializes without throwing exceptions', () => {
  const animations = global.window.AppAnimations || global.AppAnimations;
  assert.doesNotThrow(() => {
    animations.init();
  });
});

// 5. Summary
console.log('\n================================================================');
console.log(`  CURTAIN ENTRANCE TEST RESULTS: ${passed}/${passed + failed} PASSED (${Math.round((passed / (passed + failed)) * 100)}% SUCCESS RATE)`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
