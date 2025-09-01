// Connection and sync status component

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { offlineManager } from '../services/offlineSync';
import { useTranslation } from '../hooks/useLanguage';
import styles from './ConnectionStatus.module.css';

export function ConnectionStatus() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncs, setPendingSyncs] = useState(offlineManager.getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleAutoSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update pending sync count periodically
    const interval = setInterval(() => {
      setPendingSyncs(offlineManager.getPendingSyncCount());
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleAutoSync = async () => {
    if (pendingSyncs > 0) {
      setIsSyncing(true);
      try {
        await offlineManager.syncPendingChanges();
        setPendingSyncs(offlineManager.getPendingSyncCount());
      } catch (error) {
        console.error('Auto sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await offlineManager.syncPendingChanges();
      setPendingSyncs(offlineManager.getPendingSyncCount());
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingSyncs === 0) {
    // Everything is synced, show minimal status
    return (
      <div className={`${styles.status} ${styles.online}`}>
        <Wifi size={16} />
        <span>{t('online')}</span>
        {isSyncing && <RefreshCw size={14} className={styles.spinning} />}
      </div>
    );
  }

  return (
    <div className={styles.statusContainer}>
      {/* Connection Status */}
      <div className={`${styles.status} ${isOnline ? styles.online : styles.offline}`}>
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        <span>{isOnline ? t('online') : t('offline')}</span>
      </div>

      {/* Sync Status */}
      {pendingSyncs > 0 && (
        <div className={styles.syncInfo}>
          <div className={styles.syncStatus}>
            <AlertTriangle size={16} />
            <span>
              {pendingSyncs} {pendingSyncs === 1 ? 'cambio pendiente' : 'cambios pendientes'}
            </span>
          </div>
          
          {isOnline && (
            <button 
              onClick={handleManualSync}
              disabled={isSyncing}
              className={styles.syncButton}
            >
              {isSyncing ? (
                <>
                  <RefreshCw size={14} className={styles.spinning} />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  {t('syncNow')}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Offline Message */}
      {!isOnline && (
        <div className={styles.offlineMessage}>
          <span>{t('offlineMode')}</span>
        </div>
      )}
    </div>
  );
}