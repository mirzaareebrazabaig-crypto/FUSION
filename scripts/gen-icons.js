const fs = require('fs');
const path = require('path');

// Simple 1x1 transparent PNG buffer as fallback
const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

const pubDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(pubDir, 'icon-192.png'), png1x1);
fs.writeFileSync(path.join(pubDir, 'icon-512.png'), png1x1);
console.log('Icons generated in public folder');
