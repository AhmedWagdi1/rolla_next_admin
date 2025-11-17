#!/usr/bin/env node

/**
 * Helper script to convert firebase-credentials.json to escaped env format for Vercel
 * Usage: node scripts/convert-credentials.js
 */

const fs = require('fs');
const path = require('path');

const credentialsPath = path.join(__dirname, '..', 'firebase-credentials.json');

try {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  console.log('\n=== Copy these values to Vercel Environment Variables ===\n');
  console.log('FIREBASE_PROJECT_ID');
  console.log(credentials.project_id);
  console.log('\nFIREBASE_CLIENT_EMAIL');
  console.log(credentials.client_email);
  console.log('\nFIREBASE_PRIVATE_KEY');
  console.log(credentials.private_key);
  console.log('\nFIREBASE_STORAGE_BUCKET (optional)');
  console.log(`${credentials.project_id}.appspot.com`);
  console.log('\n=== End ===\n');
  
  console.log('NOTE: When pasting FIREBASE_PRIVATE_KEY to Vercel:');
  console.log('  - The key should already have real newlines (\\n characters)');
  console.log('  - Just paste it as-is into the Vercel environment variable field');
  console.log('  - Vercel will handle it correctly\n');
  
} catch (error) {
  console.error('Error reading firebase-credentials.json:', error.message);
  console.log('\nMake sure firebase-credentials.json exists in the project root.');
  process.exit(1);
}
