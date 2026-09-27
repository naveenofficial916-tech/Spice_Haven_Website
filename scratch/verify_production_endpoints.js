/**
 * Production Server Mode & Route Verification Script
 */

const http = require('http');
const assert = require('assert');

function checkEndpoint(path, expectedStatus, expectedContent) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          assert.strictEqual(res.statusCode, expectedStatus, `Status for ${path} should be ${expectedStatus}, got ${res.statusCode}`);
          if (expectedContent) {
            assert(data.includes(expectedContent), `Response for ${path} should contain "${expectedContent}"`);
          }
          console.log(`  ✔ [HTTP ${res.statusCode}] ${path} verified`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function verifyProductionRoutes() {
  console.log('--- Verifying Live Production HTTP Endpoints ---');
  try {
    await checkEndpoint('/', 200, 'Spice Haven | Artisanal Spice & Contemporary Gastronomy');
    await checkEndpoint('/index.html', 200, 'Spice Haven');
    await checkEndpoint('/assets/favicon.svg', 200);
    await checkEndpoint('/assets/restaurant-interior.jpg', 200);
    await checkEndpoint('/assets/food-composition.jpg', 200);
    await checkEndpoint('/robots.txt', 200, 'Sitemap:');
    await checkEndpoint('/sitemap.xml', 200, '<urlset');
    await checkEndpoint('/404.html', 200, 'This Table is Not in Service');
    await checkEndpoint('/api/customer/profile?email=test@example.com', 200);
    await checkEndpoint('/api/customer/favorites?email=test@example.com', 200);
    console.log('\nAll Production HTTP Endpoints are healthy and verified!\n');
  } catch (err) {
    console.error('Endpoint verification failed:', err);
    process.exit(1);
  }
}

verifyProductionRoutes();
