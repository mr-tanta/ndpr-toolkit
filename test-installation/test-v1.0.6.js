// Test script for version 1.0.6 with correct package structure
console.log('Testing @tantainnovative/ndpr-toolkit v1.0.6...\n');

// Test 1: CommonJS import
try {
  const toolkit = require('@tantainnovative/ndpr-toolkit');
  console.log('✅ CommonJS import successful');
  console.log('   Available exports:', Object.keys(toolkit).slice(0, 5).join(', '), '...');
} catch (error) {
  console.log('❌ CommonJS import failed:', error.message);
}

// Test 2: Check specific components
try {
  const { ConsentBanner, DSRRequestForm, PolicyGenerator } = require('@tantainnovative/ndpr-toolkit');
  console.log('✅ Named imports successful');
  console.log('   ConsentBanner:', typeof ConsentBanner);
  console.log('   DSRRequestForm:', typeof DSRRequestForm);
  console.log('   PolicyGenerator:', typeof PolicyGenerator);
} catch (error) {
  console.log('❌ Named imports failed:', error.message);
}

// Test 3: Check TypeScript definitions
const fs = require('fs');
const path = require('path');

try {
  const typeDefPath = path.join(
    __dirname,
    'node_modules',
    '@tantainnovative',
    'ndpr-toolkit',
    'dist',
    'index.d.ts'
  );
  
  if (fs.existsSync(typeDefPath)) {
    console.log('✅ TypeScript definitions found');
  } else {
    console.log('❌ TypeScript definitions not found');
  }
} catch (error) {
  console.log('❌ Error checking TypeScript definitions:', error.message);
}

console.log('\n📦 Package test complete!');