import { useEffect, useState } from 'react';
import { OfflineService } from '../services/offlineService';
import { syncOfflineData } from '../services/storageService';

export const useOfflineSync = (userId: string | null) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(OfflineService.getLastSyncTime());

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (userId) {
        setIsSyncing(true);
        try {
          await syncOfflineData(userId);
          setLastSync(Date.now());
        } catch (error) {
          console.error('Auto-sync failed:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync if online
    if (isOnline && userId) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  const manualSync = async () => {
    if (!userId || !isOnline) return;
    
    setIsSyncing(true);
    try {
      await syncOfflineData(userId);
      setLastSync(Date.now());
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    lastSync,
    manualSync
  };
};