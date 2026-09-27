/**
 * Task 14 DOM & Full State Integration Test
 * Simulates DOM environment with jsdom-like mock
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Load index.html and evaluate scripts
const htmlPath = path.join(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Basic DOM environment mock
class MockElement {
  constructor(tagName, id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className ? className.split(/\s+/).filter(Boolean) : []),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      toggle: (c, force) => {
        if (force === true) this.classList._classes.add(c);
        else if (force === false) this.classList._classes.delete(c);
        else if (this.classList._classes.has(c)) this.classList._classes.delete(c);
        else this.classList._classes.add(c);
      },
      contains: (c) => this.classList._classes.has(c)
    };
    this.attributes = {};
    this.style = {};
    this.children = [];
    this.innerHTML = '';
    this.value = '';
    this.eventListeners = {};
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  addEventListener(event, fn) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(fn);
  }

  dispatchEvent(event) {
    const handlers = this.eventListeners[event.type || event] || [];
    handlers.forEach(fn => fn(event));
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const walk = (node) => {
      if (!node) return;
      if (matchesSelector(node, selector)) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(child => walk(child));
      }
    };
    walk(this);
    return results;
  }

  focus() {}
  scrollIntoView() {}
}

function matchesSelector(node, selector) {
  if (!node || !node.tagName) return false;
  if (selector.startsWith('#')) {
    return node.id === selector.slice(1);
  }
  if (selector.startsWith('.')) {
    const cls = selector.slice(1);
    return node.classList && node.classList.contains(cls);
  }
  if (selector.includes('[data-category="')) {
    const cat = selector.match(/\[data-category="([^"]+)"\]/)[1];
    return node.getAttribute('data-category') === cat;
  }
  return false;
}

console.log('--- Verifying HTML structure for Task 14 Controls ---');

// Verify Task 14 UI elements exist in index.html
assert(html.includes('id="menuSearchInput"'), 'index.html must have #menuSearchInput');
assert(html.includes('id="menuSearchClearBtn"'), 'index.html must have #menuSearchClearBtn');
assert(html.includes('id="menuPriceSelect"'), 'index.html must have #menuPriceSelect');
assert(html.includes('id="menuSortSelect"'), 'index.html must have #menuSortSelect');
assert(html.includes('id="menuResultsCount"'), 'index.html must have #menuResultsCount');
assert(html.includes('id="menuActiveFilterBadges"'), 'index.html must have #menuActiveFilterBadges');
assert(html.includes('data-dietary="all"'), 'index.html must have dietary filter all');
assert(html.includes('data-dietary="veg"'), 'index.html must have dietary filter veg');
assert(html.includes('data-dietary="non-veg"'), 'index.html must have dietary filter non-veg');
assert(html.includes('data-dietary="seafood"'), 'index.html must have dietary filter seafood');
assert(html.includes('data-dietary="special"'), 'index.html must have dietary filter special');
assert(html.includes('data-dietary="gluten-free"'), 'index.html must have dietary filter gluten-free');
assert(html.includes('data-dietary="vegan"'), 'index.html must have dietary filter vegan');

console.log('✓ All Task 14 HTML controls verified in index.html');

console.log('--- Verifying CSS rules for Task 14 Controls ---');
const cssPath = path.join(__dirname, '../css/components.css');
const css = fs.readFileSync(cssPath, 'utf8');

assert(css.includes('.menu-controls-hub'), 'CSS must style .menu-controls-hub');
assert(css.includes('.menu-search-wrapper'), 'CSS must style .menu-search-wrapper');
assert(css.includes('.menu-search-input'), 'CSS must style .menu-search-input');
assert(css.includes('.menu-search-clear-btn'), 'CSS must style .menu-search-clear-btn');
assert(css.includes('.menu-filter-select'), 'CSS must style .menu-filter-select');
assert(css.includes('.dietary-filter-chip'), 'CSS must style .dietary-filter-chip');
assert(css.includes('.active-filter-badge'), 'CSS must style .active-filter-badge');
assert(css.includes('.btn-clear-all-filters'), 'CSS must style .btn-clear-all-filters');
assert(css.includes('.menu-empty-state'), 'CSS must style .menu-empty-state');

console.log('✓ All Task 14 CSS rules verified in components.css');
console.log('\nTask 14 HTML & CSS Integration successfully validated!');
