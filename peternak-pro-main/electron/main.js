const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const startURL = `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startURL);
  
  // Handle hash-based navigation for SPA
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    // Allow hash navigation but prevent external navigation
    if (parsedUrl.protocol !== 'file:' && !url.includes('#')) {
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});