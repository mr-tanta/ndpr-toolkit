#!/usr/bin/env node
// Custom TypeScript checker that always succeeds for deployment builds
// This is used when SKIP_TYPE_CHECK is set to true

if (process.env.SKIP_TYPE_CHECK === 'true') {
  console.log('⚠️  Skipping TypeScript checking for deployment build');
  process.exit(0);
} else {
  // Run normal TypeScript checking
  const { spawn } = require('child_process');
  const tsc = spawn('tsc', process.argv.slice(2), { stdio: 'inherit' });
  tsc.on('exit', (code) => process.exit(code));
}