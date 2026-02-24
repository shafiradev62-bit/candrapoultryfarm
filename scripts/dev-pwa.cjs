const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const indexHtml = path.join(rootDir, 'index.html');
const indexPwaHtml = path.join(rootDir, 'index.pwa.html');
const indexBackup = path.join(rootDir, 'index.html.backup');

// Backup original index.html
if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, indexBackup);
  console.log('✓ Backed up index.html');
}

// Copy index.pwa.html to index.html
fs.copyFileSync(indexPwaHtml, indexHtml);
console.log('✓ Using index.pwa.html as index.html');

// Start Vite dev server
const vite = spawn('npx', ['vite', '--config', 'vite.config.pwa.ts'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// Cleanup on exit
const cleanup = () => {
  if (fs.existsSync(indexBackup)) {
    fs.copyFileSync(indexBackup, indexHtml);
    fs.unlinkSync(indexBackup);
    console.log('\n✓ Restored original index.html');
  }
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
vite.on('exit', cleanup);
