const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/sections.css', 'utf8');

console.log('--- HTML CHECK ---');
const menuHasBg = html.includes('class="section restaurant-bg-section" id="menu"');
const expHasBg = html.includes('class="section restaurant-bg-section" id="experiences"');
const menuNoInlineStyle = !html.includes('id="menu" style=');

console.log('1. #menu has restaurant-bg-section:', menuHasBg);
console.log('2. #experiences has restaurant-bg-section:', expHasBg);
console.log('3. #menu inline style removed:', menuNoInlineStyle);

console.log('\n--- CSS CHECK ---');
const cssDef = css.includes('.restaurant-bg-section');
const imgRef = css.includes('restaurant-interior.jpg');
const glass = css.includes('backdrop-filter: blur');
const media = css.includes('@media (min-width: 992px)');

console.log('4. .restaurant-bg-section defined:', cssDef);
console.log('5. References restaurant-interior.jpg:', imgRef);
console.log('6. Frosted glassmorphism used:', glass);
console.log('7. Desktop parallax & responsiveness:', media);

console.log('\n--- ASSET CHECK ---');
const stats = fs.statSync('assets/restaurant-interior.jpg');
console.log('8. assets/restaurant-interior.jpg size:', stats.size, 'bytes');

const allPassed = menuHasBg && expHasBg && menuNoInlineStyle && cssDef && imgRef && glass && media && stats.size > 0;
console.log('\nOverall Result:', allPassed ? 'PASS (100%)' : 'FAIL');
process.exit(allPassed ? 0 : 1);
