import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  login: () => Promise.resolve({ success: true, user: { name: 'Test User' } }),
  logout: () => Promise.resolve(),
  getStoredToken: () => Promise.resolve(null),
  checkOnlineStatus: () => Promise.resolve(true),
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  closeWindow: () => {},
  showNotification: () => {},
  onOnlineStatusChange: () => {},
  getCourses: () => Promise.resolve([]),
  getCart: () => Promise.resolve([]),
  getOfflineData: () => Promise.resolve({ activities: [], courses: [], notifications: [] })
});