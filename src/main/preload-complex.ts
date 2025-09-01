import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  login: (email: string, password: string) => 
    ipcRenderer.invoke('auth:login', email, password),
  logout: () => 
    ipcRenderer.invoke('auth:logout'),
  getStoredToken: () => 
    ipcRenderer.invoke('auth:get-token'),
  
  // Database
  getCourses: () => 
    ipcRenderer.invoke('db:get-courses'),
  saveCourse: (course: any) => 
    ipcRenderer.invoke('db:save-course', course),
  getOfflineData: () => 
    ipcRenderer.invoke('db:get-offline-data'),
  syncData: () => 
    ipcRenderer.invoke('db:sync'),
  
  // System
  getSystemInfo: () => 
    ipcRenderer.invoke('system:info'),
  checkOnlineStatus: () => 
    ipcRenderer.invoke('system:online-status'),
  minimizeWindow: () => 
    ipcRenderer.send('window:minimize'),
  maximizeWindow: () => 
    ipcRenderer.send('window:maximize'),
  closeWindow: () => 
    ipcRenderer.send('window:close'),
  
  // Notifications
  showNotification: (title: string, body: string) => 
    ipcRenderer.send('notification:show', { title, body }),
  
  // Updates
  checkForUpdates: () => 
    ipcRenderer.invoke('updater:check'),
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on('updater:update-available', (_, info) => callback(info));
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('updater:update-downloaded', callback);
  },
  downloadUpdate: () => 
    ipcRenderer.send('updater:download'),
  installUpdate: () => 
    ipcRenderer.send('updater:install'),
  
  // Online/Offline events
  onOnlineStatusChange: (callback: (isOnline: boolean) => void) => {
    ipcRenderer.on('online-status-changed', (_, isOnline) => callback(isOnline));
  },
  
  // Cart
  getCart: () => 
    ipcRenderer.invoke('cart:get'),
  addToCart: (courseId: string) => 
    ipcRenderer.invoke('cart:add', courseId),
  removeFromCart: (courseId: string) => 
    ipcRenderer.invoke('cart:remove', courseId),
  clearCart: () => 
    ipcRenderer.invoke('cart:clear'),
  checkout: (cartItems: any[]) => 
    ipcRenderer.invoke('cart:checkout', cartItems)
});

// Type definitions for TypeScript
export interface IElectronAPI {
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  getStoredToken: () => Promise<string | null>;
  getCourses: () => Promise<any[]>;
  saveCourse: (course: any) => Promise<void>;
  getOfflineData: () => Promise<any>;
  syncData: () => Promise<void>;
  getSystemInfo: () => Promise<any>;
  checkOnlineStatus: () => Promise<boolean>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  showNotification: (title: string, body: string) => void;
  checkForUpdates: () => Promise<any>;
  onUpdateAvailable: (callback: (info: any) => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  downloadUpdate: () => void;
  installUpdate: () => void;
  onOnlineStatusChange: (callback: (isOnline: boolean) => void) => void;
  getCart: () => Promise<any[]>;
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (cartItems: any[]) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}