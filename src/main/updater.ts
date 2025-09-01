import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow, ipcMain } from 'electron';

export function setupAutoUpdater() {
  // Configure auto-updater
  autoUpdater.checkForUpdatesAndNotify();
  
  // Auto-updater events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('updater:update-available', info);
    });
  });
  
  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info);
  });
  
  autoUpdater.on('error', (err) => {
    console.error('Error in auto-updater:', err);
  });
  
  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = 'Download speed: ' + progressObj.bytesPerSecond;
    logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
    logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    console.log(logMessage);
    
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('updater:download-progress', progressObj);
    });
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info);
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('updater:update-downloaded');
    });
  });
  
  // IPC handlers for manual update control
  ipcMain.handle('updater:check', async () => {
    const result = await autoUpdater.checkForUpdates();
    return result;
  });
  
  ipcMain.on('updater:download', () => {
    autoUpdater.downloadUpdate();
  });
  
  ipcMain.on('updater:install', () => {
    autoUpdater.quitAndInstall();
  });
}