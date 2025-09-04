import { contextBridge, ipcRenderer } from 'electron';

// Clean preload script without demo data
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  login: (email: string, password: string) => ipcRenderer.invoke('auth:login', email, password),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getCurrentUser: () => ipcRenderer.invoke('auth:current-user'),
  
  // Courses
  getCourses: () => ipcRenderer.invoke('courses:list'),
  getCourse: (id: string) => ipcRenderer.invoke('courses:get', id),
  enrollCourse: (id: string) => ipcRenderer.invoke('courses:enroll', id),
  
  // Database operations
  getDatabase: () => ipcRenderer.invoke('db:get'),
  query: (sql: string, params?: any[]) => ipcRenderer.invoke('db:query', sql, params),
  
  // File operations
  showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:save', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:open', options),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: any) => ipcRenderer.invoke('settings:set', settings),
  
  // Notifications
  showNotification: (title: string, body: string) => ipcRenderer.invoke('notification:show', title, body),
  
  // App info
  getVersion: () => ipcRenderer.invoke('app:version'),
  getPath: (name: string) => ipcRenderer.invoke('app:path', name),
  
  // Online status (stub functions for web compatibility)
  onOnlineStatusChange: (callback: (online: boolean) => void) => {
    // Stub function - assume online in Electron
    callback(true);
  },
  checkOnlineStatus: () => Promise.resolve(true)
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      login: (email: string, password: string) => Promise<any>;
      logout: () => Promise<void>;
      getCurrentUser: () => Promise<any>;
      getCourses: () => Promise<any[]>;
      getCourse: (id: string) => Promise<any>;
      enrollCourse: (id: string) => Promise<any>;
      getDatabase: () => Promise<any>;
      query: (sql: string, params?: any[]) => Promise<any>;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      getSettings: () => Promise<any>;
      setSettings: (settings: any) => Promise<void>;
      showNotification: (title: string, body: string) => Promise<void>;
      getVersion: () => Promise<string>;
      getPath: (name: string) => Promise<string>;
      onOnlineStatusChange: (callback: (online: boolean) => void) => void;
      checkOnlineStatus: () => Promise<boolean>;
    };
  }
}