import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Settings
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  autoDownload: boolean;
  soundEnabled: boolean;
  volume: number;
  
  // Actions
  setNotifications: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'es' | 'en') => void;
  setAutoDownload: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  resetSettings: () => void;
  applyTheme: () => void;
}

const defaultSettings = {
  notifications: true,
  theme: 'system' as const,
  language: 'es' as const,
  autoDownload: false,
  soundEnabled: true,
  volume: 80
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setNotifications: (enabled: boolean) => {
        set({ notifications: enabled });
        console.log(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
        
        // Notify Electron about notification preference change
        if (window.electronAPI?.updateNotificationSettings) {
          window.electronAPI.updateNotificationSettings(enabled);
        }
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        console.log(`Theme changed to: ${theme}`);
        get().applyTheme();
      },

      setLanguage: (language: 'es' | 'en') => {
        set({ language });
        console.log(`Language changed to: ${language}`);
        
        // Here you could trigger language change logic
        document.documentElement.lang = language;
      },

      setAutoDownload: (enabled: boolean) => {
        set({ autoDownload: enabled });
        console.log(`Auto-download ${enabled ? 'enabled' : 'disabled'}`);
        
        // Notify Electron about download preference
        if (window.electronAPI?.updateDownloadSettings) {
          window.electronAPI.updateDownloadSettings(enabled);
        }
      },

      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled });
        console.log(`Sound ${enabled ? 'enabled' : 'disabled'}`);
        
        // Mute/unmute all audio
        if (!enabled) {
          // Mute all audio elements
          const audioElements = document.querySelectorAll('audio, video');
          audioElements.forEach(el => {
            (el as HTMLAudioElement | HTMLVideoElement).muted = true;
          });
        }
      },

      setVolume: (volume: number) => {
        set({ volume });
        console.log(`Volume set to: ${volume}%`);
        
        // Apply volume to all audio elements
        const audioElements = document.querySelectorAll('audio, video');
        audioElements.forEach(el => {
          (el as HTMLAudioElement | HTMLVideoElement).volume = volume / 100;
        });
      },

      resetSettings: () => {
        set(defaultSettings);
        console.log('Settings reset to defaults');
        get().applyTheme();
        
        // Reset document language
        document.documentElement.lang = defaultSettings.language;
      },

      applyTheme: () => {
        const { theme } = get();
        const root = document.documentElement;
        
        if (theme === 'system') {
          // Use system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
          root.setAttribute('data-theme', theme);
        }
      }
    }),
    {
      name: 'aula-virtual-settings',
      version: 1,
    }
  )
);

// Initialize theme on app start
if (typeof window !== 'undefined') {
  // Apply theme immediately
  const settings = useSettingsStore.getState();
  settings.applyTheme();
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme, applyTheme } = useSettingsStore.getState();
    if (theme === 'system') {
      applyTheme();
    }
  });
}