const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    const hasDollar = body.includes('$');
    const hasRupee = body.includes('₹');
    console.log('Contains $: ' + hasDollar);
    console.log('Contains ₹: ' + hasRupee);
    if (hasDollar) {
      const lines = body.split('\n').filter(l => l.includes('$'));
      console.log('Dollar lines found:', lines);
    } else {
      console.log('SUCCESS: Zero dollar signs in served HTML!');
    }
  });
}).on('error', (err) => {
  console.error('Server request error:', err.message);
});
