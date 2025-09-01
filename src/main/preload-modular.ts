import { contextBridge } from 'electron';
import { seedCourses, seedActivities, seedNotifications } from './seedData';

// Mock cart data
let mockCart = [
  {
    id: 1,
    course_id: 'ai401',
    title: 'Introducción a la Inteligencia Artificial',
    price: 2000,
    thumbnail: '/images/courses/ai.jpg',
    instructor: 'Dr. Ana López',
    quantity: 1
  },
  {
    id: 2,
    course_id: 'web601',
    title: 'Desarrollo Web Full Stack',
    price: 2200,
    thumbnail: '/images/courses/webdev.jpg',
    instructor: 'Ing. Laura Herrera',
    quantity: 1
  },
  {
    id: 3,
    course_id: 'data901',
    title: 'Ciencia de Datos con Python',
    price: 1900,
    thumbnail: '/images/courses/datascience.jpg',
    instructor: 'Dr. Fernando Castro',
    quantity: 1
  }
];

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth APIs
  login: (email: string, _password: string) => 
    Promise.resolve({ 
      success: true, 
      user: { 
        id: 1,
        name: 'Carlos Martínez Rodríguez', 
        email: email,
        role: 'student' 
      } 
    }),
  logout: () => Promise.resolve(),
  getStoredToken: () => Promise.resolve('demo_token_123'),
  
  // Course APIs
  getCourses: () => Promise.resolve(seedCourses),
  saveCourse: () => Promise.resolve(),
  
  // Offline data
  getOfflineData: () => Promise.resolve({
    courses: seedCourses.filter(c => c.is_enrolled),
    activities: seedActivities,
    notifications: seedNotifications.filter(n => !n.read)
  }),
  
  // System APIs
  checkOnlineStatus: () => Promise.resolve(true),
  minimizeWindow: () => console.log('Window minimized'),
  maximizeWindow: () => console.log('Window maximized'),
  closeWindow: () => console.log('Window closed'),
  showNotification: (title: string, body: string) => {
    console.log('Notification:', title, body);
  },
  onOnlineStatusChange: (_callback: (isOnline: boolean) => void) => {
    // Simulate online status changes
    console.log('Online status listener added');
  },
  
  // Cart APIs
  getCart: () => Promise.resolve(mockCart),
  addToCart: (courseId: string) => {
    const course = seedCourses.find(c => c.id === courseId);
    if (course && !mockCart.find(item => item.course_id === courseId)) {
      mockCart.push({
        id: mockCart.length + 1,
        course_id: courseId,
        title: course.title,
        price: course.price,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        quantity: 1
      });
    }
    return Promise.resolve();
  },
  removeFromCart: (courseId: string) => {
    mockCart = mockCart.filter(item => item.course_id !== courseId);
    return Promise.resolve();
  },
  clearCart: () => {
    mockCart = [];
    return Promise.resolve();
  },
  checkout: (cartItems: any[]) => {
    // Simulate checkout process
    setTimeout(() => {
      // Mark courses as enrolled
      cartItems.forEach(item => {
        const course = seedCourses.find(c => c.id === item.course_id);
        if (course) {
          course.is_enrolled = true;
          course.progress = 0;
        }
      });
      mockCart = [];
    }, 1000);
    
    return Promise.resolve({ success: true });
  },
  
  syncData: () => Promise.resolve()
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
  checkOnlineStatus: () => Promise<boolean>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  showNotification: (title: string, body: string) => void;
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