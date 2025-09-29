import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  console.log('🎓 Iniciando Aula Virtual 2.0...');
  
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
    show: false,
    icon: path.join(__dirname, '../../public/icon.png')
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In packaged app, renderer files are in the same dist structure
    const indexPath = path.join(__dirname, '../../renderer/index.html');
    console.log('📁 Loading renderer from:', indexPath);
    mainWindow.loadFile(indexPath);
  }
  
  mainWindow.webContents.on('did-fail-load', (_, __, errorDescription, validatedURL) => {
    console.error('❌ Failed to load:', errorDescription, 'URL:', validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Renderer loaded successfully');
  });

  mainWindow.once('ready-to-show', () => {
    console.log('🚀 Aplicación lista - Aula Virtual 2.0');
    console.log('🔐 Conectando con API en http://85.31.235.51:3001');
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