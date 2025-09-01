import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';
import path from 'path';
import { initDatabase } from './database';
import { setupAutoUpdater } from './updater';
// import { createAuthWindow } from './windows/auth';
import { createMainWindow } from './windows/main';
import { setupIPCHandlers } from './ipc';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Handle single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Security: Set Content Security Policy
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});

// Initialize app
async function createWindow() {
  // Initialize database
  await initDatabase();
  
  // Create main window
  mainWindow = await createMainWindow();
  
  // Setup IPC handlers
  setupIPCHandlers();
  
  // Setup auto-updater
  if (app.isPackaged) {
    setupAutoUpdater();
  }
  
  // Create system tray
  createTray();
  
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../../public/icon.png')
  );
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar',
      click: () => {
        mainWindow?.show();
      }
    },
    {
      label: 'Minimizar',
      click: () => {
        mainWindow?.hide();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Salir',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Aula Virtual 2.0');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow?.show();
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Export for cleanup
export { mainWindow };