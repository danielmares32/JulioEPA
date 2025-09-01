import React, { useState } from 'react';
import { 
  Bell, 
  Monitor,
  Volume2,
  Download,
  Save,
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useTranslation } from '../hooks/useLanguage';
import styles from './Settings.module.css';

export function SettingsPage() {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const { t } = useTranslation();
  
  const {
    notifications,
    theme,
    language,
    autoDownload,
    soundEnabled,
    volume,
    setNotifications,
    setTheme,
    setLanguage,
    setAutoDownload,
    setSoundEnabled,
    setVolume,
    resetSettings
  } = useSettingsStore();

  const saveSettings = async () => {
    setSaveStatus('saving');
    
    try {
      // Simulate saving time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Here you could save to additional storage or sync with server
      console.log('Settings saved successfully');
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (confirm(t('resetConfirm'))) {
      resetSettings();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>{t('settingsTitle')}</h1>
          <p className={styles.pageSubtitle}>{t('settingsSubtitle')}</p>
        </div>

        <div className={styles.simpleSettings}>
          {/* Notifications */}
          <div className={styles.settingGroup}>
            <h2 className={styles.groupTitle}>
              <Bell size={20} />
              {t('notifications')}
            </h2>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>{t('notifications')}</span>
                <span className={styles.settingDescription}>{t('notificationsDesc')}</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>

          {/* Appearance */}
          <div className={styles.settingGroup}>
            <h2 className={styles.groupTitle}>
              <Monitor size={20} />
              {t('appearance')}
            </h2>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>{t('theme')}</span>
                <span className={styles.settingDescription}>{t('themeDesc')}</span>
              </div>
              <select 
                className={styles.selectInput}
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              >
                <option value="light">{t('light')}</option>
                <option value="dark">{t('dark')}</option>
                <option value="system">{t('automatic')}</option>
              </select>
            </div>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>{t('language')}</span>
                <span className={styles.settingDescription}>{t('languageDesc')}</span>
              </div>
              <select 
                className={styles.selectInput}
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Storage */}
          <div className={styles.settingGroup}>
            <h2 className={styles.groupTitle}>
              <Download size={20} />
              {t('downloads')}
            </h2>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>{t('autoDownload')}</span>
                <span className={styles.settingDescription}>{t('autoDownloadDesc')}</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={autoDownload}
                  onChange={(e) => setAutoDownload(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </div>

          {/* Audio */}
          <div className={styles.settingGroup}>
            <h2 className={styles.groupTitle}>
              <Volume2 size={20} />
              {t('audio')}
            </h2>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>{t('soundsEnabled')}</span>
                <span className={styles.settingDescription}>{t('soundsEnabledDesc')}</span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
            
            {soundEnabled && (
              <>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <span className={styles.settingLabel}>{t('volume')}</span>
                    <span className={styles.settingDescription}>{t('volumeDesc')}</span>
                  </div>
                  <div className={styles.volumeControl}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className={styles.volumeSlider}
                    />
                    <span className={styles.volumeValue}>{volume}%</span>
                  </div>
                </div>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <span className={styles.settingLabel}>{t('testSound')}</span>
                    <span className={styles.settingDescription}>{t('testSoundDesc')}</span>
                  </div>
                  <button 
                    className={styles.testButton}
                    onClick={() => {
                      console.log('Test sound clicked');
                      if (window.electronAPI?.playTestSound) {
                        window.electronAPI.playTestSound();
                      }
                    }}
                  >
                    {t('testSoundBtn')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionBar}>
          <button 
            className={`${styles.primaryButton} ${saveStatus === 'saving' ? styles.loading : ''}`}
            onClick={saveSettings}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw size={16} className={styles.spinning} />
                {t('saving')}
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check size={16} />
                {t('saved')}
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertTriangle size={16} />
                {t('error')}
              </>
            ) : (
              <>
                <Save size={16} />
                {t('saveChanges')}
              </>
            )}
          </button>
          <button 
            className={styles.dangerButton} 
            onClick={handleReset}
            disabled={saveStatus === 'saving'}
          >
            <RefreshCw size={16} />
            {t('reset')}
          </button>
        </div>
      </div>
    </div>
  );
}