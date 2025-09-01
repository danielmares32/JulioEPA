// Offline synchronization and caching system

import { apiClient } from './api';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface PendingSync {
  id: string;
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineManager {
  private cache = new Map<string, CacheItem<any>>();
  private pendingSyncs: PendingSync[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.loadFromStorage();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Save to storage before page unload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }

  private loadFromStorage() {
    try {
      const cacheData = localStorage.getItem('app_cache');
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(parsed.cache || []);
      }

      const pendingData = localStorage.getItem('pending_syncs');
      if (pendingData) {
        this.pendingSyncs = JSON.parse(pendingData);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('app_cache', JSON.stringify({
        cache: Array.from(this.cache.entries()),
      }));

      localStorage.setItem('pending_syncs', JSON.stringify(this.pendingSyncs));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  private startPeriodicSync() {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingChanges();
      }
    }, 5 * 60 * 1000);
  }

  // Cache management
  setCache<T>(key: string, data: T, ttl: number = 30 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    this.saveToStorage();
  }

  getCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return item.data;
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    this.saveToStorage();
  }

  // Offline operations queue
  queueForSync(endpoint: string, method: string, data: any): void {
    const syncItem: PendingSync = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.pendingSyncs.push(syncItem);
    this.saveToStorage();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingChanges();
    }
  }

  async syncPendingChanges(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    const failedSyncs: PendingSync[] = [];

    for (const sync of this.pendingSyncs) {
      try {
        await this.executePendingSync(sync);
        console.log(`Synced: ${sync.method} ${sync.endpoint}`);
      } catch (error) {
        console.error(`Failed to sync: ${sync.method} ${sync.endpoint}`, error);
        
        sync.retries += 1;
        if (sync.retries < 3) {
          failedSyncs.push(sync);
        } else {
          console.warn(`Abandoning sync after 3 retries: ${sync.method} ${sync.endpoint}`);
        }
      }
    }

    this.pendingSyncs = failedSyncs;
    this.saveToStorage();
    this.syncInProgress = false;
  }

  private async executePendingSync(sync: PendingSync): Promise<void> {
    const options: RequestInit = {
      method: sync.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (sync.data) {
      if (sync.data instanceof FormData) {
        options.body = sync.data;
        delete (options.headers as any)['Content-Type']; // Let browser set it for FormData
      } else {
        options.body = JSON.stringify(sync.data);
      }
    }

    const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://api.aulavirtual.uaa.mx' : 'http://localhost:3001/api'}${sync.endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  // Helper methods for common operations
  async getCachedOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl: number = 30 * 60 * 1000
  ): Promise<T> {
    // Try cache first
    const cached = this.getCache<T>(cacheKey);
    if (cached) {
      return cached;
    }

    // If offline and no cache, throw error
    if (!this.isOnline) {
      throw new Error('No cached data available offline');
    }

    // Fetch from API
    try {
      const data = await fetchFn();
      this.setCache(cacheKey, data, ttl);
      return data;
    } catch (error) {
      // If fetch fails but we have expired cache, return that
      const expiredCache = this.cache.get(cacheKey);
      if (expiredCache) {
        console.warn('Using expired cache due to fetch failure');
        return expiredCache.data;
      }
      throw error;
    }
  }

  // Progress tracking for offline scenarios
  saveProgressOffline(lessonId: string, progress: any): void {
    this.setCache(`lesson_progress_${lessonId}`, progress);
    
    if (this.isOnline) {
      // Queue for immediate sync
      this.queueForSync(`/lessons/${lessonId}/progress`, 'PUT', progress);
    }
  }

  getOfflineProgress(lessonId: string): any | null {
    return this.getCache(`lesson_progress_${lessonId}`);
  }

  // Quiz attempts offline
  saveQuizAttemptOffline(attemptId: string, attempt: any): void {
    this.setCache(`quiz_attempt_${attemptId}`, attempt);
  }

  // Assignment submissions offline
  saveAssignmentOffline(assignmentId: string, submission: any): void {
    this.setCache(`assignment_submission_${assignmentId}`, submission);
    
    // Queue for sync when online
    this.queueForSync(`/assignment-submissions`, 'POST', submission);
  }

  // Status methods
  isOffline(): boolean {
    return !this.isOnline;
  }

  hasPendingSyncs(): boolean {
    return this.pendingSyncs.length > 0;
  }

  getPendingSyncCount(): number {
    return this.pendingSyncs.length;
  }

  // Clear all offline data (for logout)
  clearAll(): void {
    this.cache.clear();
    this.pendingSyncs = [];
    localStorage.removeItem('app_cache');
    localStorage.removeItem('pending_syncs');
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();

// Enhanced API client with offline support
export class OfflineApiClient {
  async getCourse(courseId: string) {
    return offlineManager.getCachedOrFetch(
      `course_${courseId}`,
      () => apiClient.getCourseWithModules(courseId),
      60 * 60 * 1000 // 1 hour cache
    );
  }

  async updateLessonProgress(lessonId: string, progress: any) {
    // Save offline first
    offlineManager.saveProgressOffline(lessonId, progress);

    if (offlineManager.isOffline()) {
      return { success: true, data: progress }; // Return optimistic response
    }

    try {
      return await apiClient.updateLessonProgress({ lessonId, ...progress });
    } catch (error) {
      // If API fails, queue for later sync
      offlineManager.queueForSync(`/lessons/${lessonId}/progress`, 'PUT', progress);
      return { success: true, data: progress }; // Optimistic response
    }
  }

  async submitAssignment(assignmentId: string, files: File[], text?: string) {
    const submission = { assignmentId, files, submissionText: text };

    if (offlineManager.isOffline()) {
      offlineManager.saveAssignmentOffline(assignmentId, submission);
      return { success: true, data: submission };
    }

    try {
      return await apiClient.createAssignmentSubmission(submission);
    } catch (error) {
      offlineManager.saveAssignmentOffline(assignmentId, submission);
      throw error;
    }
  }

  async getUserCourses() {
    return offlineManager.getCachedOrFetch(
      'user_courses',
      () => apiClient.getUserEnrollments(),
      30 * 60 * 1000 // 30 minutes cache
    );
  }

  async getDashboardStats() {
    return offlineManager.getCachedOrFetch(
      'dashboard_stats',
      () => apiClient.getUserDashboardStats(),
      15 * 60 * 1000 // 15 minutes cache
    );
  }
}

export const offlineApi = new OfflineApiClient();