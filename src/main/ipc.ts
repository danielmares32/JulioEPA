import { ipcMain, Notification, app } from 'electron';
import { getDatabase } from './database';
import crypto from 'crypto';
import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'https://api.uaa.edu.mx';

export function setupIPCHandlers() {
  const db = getDatabase();
  
  // Authentication handlers
  ipcMain.handle('auth:login', async (_, email: string, password: string) => {
    try {
      // For demo, simulate API call
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      // Check local database first (offline mode)
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      
      if (user) {
        // Update token
        const token = crypto.randomBytes(32).toString('hex');
        db.prepare('UPDATE users SET token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(token, user.id);
        
        return { success: true, user: { ...user, token } };
      }
      
      // If online, try API
      // For demo purposes, create a mock user
      const mockUser = {
        email,
        name: email.split('@')[0],
        role: 'student',
        token: crypto.randomBytes(32).toString('hex')
      };
      
      // Save to local database
      db.prepare(`
        INSERT OR REPLACE INTO users (email, name, role, token)
        VALUES (?, ?, ?, ?)
      `).run(mockUser.email, mockUser.name, mockUser.role, mockUser.token);
      
      return { success: true, user: mockUser };
    } catch (error) {
      return { success: false, error: 'Invalid credentials' };
    }
  });
  
  ipcMain.handle('auth:logout', async () => {
    const user = db.prepare('SELECT * FROM users WHERE token IS NOT NULL').get();
    if (user) {
      db.prepare('UPDATE users SET token = NULL WHERE id = ?').run(user.id);
    }
  });
  
  ipcMain.handle('auth:get-token', async () => {
    const user = db.prepare('SELECT token FROM users WHERE token IS NOT NULL').get();
    return user?.token || null;
  });
  
  // Database handlers
  ipcMain.handle('db:get-courses', async () => {
    const courses = db.prepare('SELECT * FROM courses ORDER BY updated_at DESC').all();
    return courses;
  });
  
  ipcMain.handle('db:save-course', async (_, course) => {
    db.prepare(`
      INSERT OR REPLACE INTO courses (id, title, description, instructor, thumbnail, price, duration, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      course.id,
      course.title,
      course.description,
      course.instructor,
      course.thumbnail,
      course.price,
      course.duration,
      course.category
    );
  });
  
  ipcMain.handle('db:get-offline-data', async () => {
    const courses = db.prepare('SELECT * FROM courses WHERE is_downloaded = 1').all();
    const activities = db.prepare('SELECT * FROM activities ORDER BY created_at DESC LIMIT 10').all();
    const notifications = db.prepare('SELECT * FROM notifications WHERE read = 0').all();
    
    return { courses, activities, notifications };
  });
  
  ipcMain.handle('db:sync', async () => {
    const pendingSync = db.prepare('SELECT * FROM sync_queue WHERE status = ?').all('pending');
    
    for (const item of pendingSync) {
      try {
        // Attempt to sync with server
        // For demo, mark as synced
        db.prepare('UPDATE sync_queue SET status = ?, synced_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run('synced', item.id);
      } catch (error) {
        db.prepare('UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?')
          .run(item.id);
      }
    }
  });
  
  // System handlers
  ipcMain.handle('system:info', async () => {
    return {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      userData: app.getPath('userData')
    };
  });
  
  ipcMain.handle('system:online-status', async () => {
    try {
      await axios.head('https://www.google.com', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  });
  
  // Window handlers
  ipcMain.on('window:minimize', (event) => {
    const window = event.sender.getOwnerBrowserWindow();
    window?.minimize();
  });
  
  ipcMain.on('window:maximize', (event) => {
    const window = event.sender.getOwnerBrowserWindow();
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });
  
  ipcMain.on('window:close', (event) => {
    const window = event.sender.getOwnerBrowserWindow();
    window?.close();
  });
  
  // Notification handlers
  ipcMain.on('notification:show', (_, { title, body }) => {
    new Notification({ title, body }).show();
  });
  
  // Cart handlers
  ipcMain.handle('cart:get', async () => {
    const cartItems = db.prepare(`
      SELECT c.*, co.title, co.price, co.thumbnail, co.instructor
      FROM cart c
      JOIN courses co ON c.course_id = co.id
    `).all();
    return cartItems;
  });
  
  ipcMain.handle('cart:add', async (_, courseId: string) => {
    db.prepare('INSERT OR IGNORE INTO cart (course_id) VALUES (?)').run(courseId);
  });
  
  ipcMain.handle('cart:remove', async (_, courseId: string) => {
    db.prepare('DELETE FROM cart WHERE course_id = ?').run(courseId);
  });
  
  ipcMain.handle('cart:clear', async () => {
    db.prepare('DELETE FROM cart').run();
  });
  
  ipcMain.handle('cart:checkout', async (_, cartItems) => {
    // Process checkout
    for (const item of cartItems) {
      db.prepare('UPDATE courses SET is_enrolled = 1 WHERE id = ?').run(item.course_id);
    }
    
    // Clear cart
    db.prepare('DELETE FROM cart').run();
    
    return { success: true };
  });
}