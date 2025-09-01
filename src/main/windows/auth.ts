import { BrowserWindow } from 'electron';
import path from 'path';

export async function createAuthWindow(): Promise<BrowserWindow> {
  const authWindow = new BrowserWindow({
    width: 500,
    height: 600,
    resizable: false,
    frame: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1E3A8A',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js')
    },
    icon: path.join(__dirname, '../../../public/icon.png'),
    show: false
  });

  // Load auth page
  if (process.env.NODE_ENV === 'development') {
    await authWindow.loadURL('http://localhost:3000/auth');
  } else {
    await authWindow.loadFile(path.join(__dirname, '../../renderer/index.html'), {
      hash: '/auth'
    });
  }

  authWindow.once('ready-to-show', () => {
    authWindow.show();
  });

  return authWindow;
}