import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initDatabase } from './database';
import { initializeSeedData } from './seedData';

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  // Initialize database first
  await initDatabase();
  
  // Initialize seed data for demo
  await initializeSeedData();
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1E3A8A',
    show: false
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });
};

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