// Test importing from the correct path
const toolkit = require('@tantainnovative/ndpr-toolkit/packages/ndpr-toolkit/dist/index.js');

console.log('✅ Successfully imported from correct path');
console.log('Available exports:', Object.keys(toolkit).slice(0, 10), '...');