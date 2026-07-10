import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { auth } from '../services/firebase';
import { useAuthStore, ASYNC_STORAGE_KEYS as AUTH_KEYS } from '../stores/useAuthStore';
import { useFinanceStore, FINANCE_STORAGE_KEYS, defaultCards } from '../stores/useFinanceStore';
import { syncToBackendNow } from '../services/syncBackend';
import { create } from 'zustand';
import i18n from '../i18n';
import { apiFetch } from '../services/api';

interface SyncState {
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  setSyncStatus: (status: 'synced' | 'syncing' | 'error' | 'offline') => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  syncStatus: 'offline',
  setSyncStatus: (status) => set({ syncStatus: status })
}));

/**
 * Loads finance data from AsyncStorage as a fallback when the backend is unavailable.
 * Returns the data object or null if nothing is found.
 */
async function loadFromAsyncStorage(): Promise<Record<string, any> | null> {
  try {
    const { useAuthStore } = require('../stores/useAuthStore');
    const uid = useAuthStore.getState().activeUid || 'guest';
    const keys = [
      FINANCE_STORAGE_KEYS.ENTRIES,
      FINANCE_STORAGE_KEYS.EXITS,
      FINANCE_STORAGE_KEYS.RECURRINGS,
      FINANCE_STORAGE_KEYS.PURCHASES,
      FINANCE_STORAGE_KEYS.SAVINGS,
      FINANCE_STORAGE_KEYS.SAVINGS_GOAL,
      FINANCE_STORAGE_KEYS.CREDIT_CARDS,
      FINANCE_STORAGE_KEYS.INSTALLMENT_STATUS,
      FINANCE_STORAGE_KEYS.LANGUAGE,
      FINANCE_STORAGE_KEYS.LAST_UPDATED,
    ];

    const promises = keys.map(async (key) => {
      const scopedKey = `${uid}:${key}`;
      const val = await AsyncStorage.getItem(scopedKey);
      return [key, val] as [string, string | null];
    });
    const pairs = await Promise.all(promises);
    const raw = pairs.reduce((acc: Record<string, string | null>, [key, val]: [string, string | null]) => {
      acc[key] = val;
      return acc;
    }, {} as Record<string, string | null>);

    // Check if there's any meaningful data
    const hasData = Object.values(raw).some(v => v !== null && v !== undefined);
    if (!hasData) return null;

    const safeParse = (val: string | null, fallback: any) => {
      if (val === null || val === undefined) return fallback;
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    };

    return {
      entries: safeParse(raw[FINANCE_STORAGE_KEYS.ENTRIES], []),
      exits: safeParse(raw[FINANCE_STORAGE_KEYS.EXITS], []),
      recurrings: safeParse(raw[FINANCE_STORAGE_KEYS.RECURRINGS], []),
      purchases: safeParse(raw[FINANCE_STORAGE_KEYS.PURCHASES], []),
      savingsLogs: safeParse(raw[FINANCE_STORAGE_KEYS.SAVINGS], {}),
      creditCards: safeParse(raw[FINANCE_STORAGE_KEYS.CREDIT_CARDS], defaultCards),
      installmentStatusMap: safeParse(raw[FINANCE_STORAGE_KEYS.INSTALLMENT_STATUS], {}),
      savingsGoal: safeParse(raw[FINANCE_STORAGE_KEYS.SAVINGS_GOAL], 0),
      language: safeParse(raw[FINANCE_STORAGE_KEYS.LANGUAGE], 'pt'),
      lastUpdatedAt: parseInt(raw[FINANCE_STORAGE_KEYS.LAST_UPDATED] || '0', 10) || 0,
    };
  } catch (err) {
    console.error('Error loading from AsyncStorage fallback:', err);
    return null;
  }
}

export function useGlobalSync() {
  const isSyncingFromCloud = useRef(false);
  const pendingSyncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const periodicSyncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Register beforeunload handler on web to flush pending changes using sendBeacon
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const uid = useAuthStore.getState().user?.uid;
      if (!uid) return;

      
      // Cancel any pending debounced sync
      if (pendingSyncTimeout.current) {
        clearTimeout(pendingSyncTimeout.current);
        pendingSyncTimeout.current = null;
      }

      // Best-effort sync before page close — syncToBackendNow has built-in validation
      if (uid) {
        syncToBackendNow(uid, 1).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Main auth state listener — loads data from backend (or AsyncStorage fallback) on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const { setUser, setUserProfile, setAuthInitialized, setSuspendedMsg, logout, setActiveUid, activeUid } = useAuthStore.getState();
      const { setFinanceData, clearAllData: clearFinance } = useFinanceStore.getState();
      const { clearAllData: clearInvestments } = require('../stores/useInvestmentStore').useInvestmentStore.getState();
      const { setSyncStatus } = useSyncStore.getState();

      setUser(currentUser);
      
      if (currentUser) {
        if (activeUid !== currentUser.uid) {
           await clearFinance();
           await clearInvestments();
        }
        setActiveUid(currentUser.uid);
        
        setSyncStatus('syncing');

        // Self-heal local state instantly for admins, in case they are offline
        const emailLower = currentUser.email?.trim().toLowerCase();
        if (emailLower === 'lucaspoletis@gmail.com') {
          const currentProfile = useAuthStore.getState().userProfile;
          if (currentProfile.role !== 'admin' || currentProfile.activePlan !== 'premium') {
            setUserProfile({ role: 'admin', activePlan: 'premium' });
          }
        }

        try {
          const cloudData = await apiFetch('/api/sync');
          
          if (cloudData && cloudData.userProfile !== null) {
            const cloudUserProfile = cloudData.userProfile || {};
            
            if (cloudUserProfile.status === 'suspended') {
              setSuspendedMsg('Sua conta foi suspensa pela administração.');
              await logout();
              setSyncStatus('offline');
              setAuthInitialized(true);
              return;
            }
            
            const emailLower = currentUser.email?.trim().toLowerCase();
            if (emailLower === 'lucaspoletis@gmail.com') {
              cloudUserProfile.role = 'admin';
            }

            const cloudTime = cloudData.updatedAt || 0;
            
            // Load local data to compare timestamps
            const localData = await loadFromAsyncStorage();
            const localTime = localData?.lastUpdatedAt || 0;

            // ALWAYS prefer cloud data if it has any financial records.
            // Only use local data if cloud is truly empty AND local has data.
            const cloudHasData = (cloudData.entries?.length > 0 || cloudData.exits?.length > 0 ||
              cloudData.recurrings?.length > 0 || cloudData.purchases?.length > 0);
            const localHasData = localData && (localData.entries?.length > 0 || localData.exits?.length > 0 ||
              localData.recurrings?.length > 0 || localData.purchases?.length > 0);

            let sourceData: any;
            let sourceLabel: string;

            if (localHasData && localTime > cloudTime) {
              // Local data is newer (e.g., user refreshed before sync finished)
              sourceData = localData;
              sourceLabel = 'AsyncStorage (local - newer)';
            } else if (cloudHasData) {
              // Cloud has data and is newer or equal
              sourceData = cloudData;
              sourceLabel = 'Cloud (Supabase)';
            } else if (localHasData) {
              // Cloud empty but local has data — use local and push to cloud
              sourceData = localData;
              sourceLabel = 'AsyncStorage (local - cloud empty)';
            } else {
              // Both empty — use cloud defaults
              sourceData = cloudData;
              sourceLabel = 'Cloud (empty/defaults)';
            }
            
            console.log(`[Sync] Loading data from ${sourceLabel} (cloud: ${cloudTime}, local: ${localTime}, cloudHasData: ${cloudHasData}, localHasData: ${localHasData})`);

            isSyncingFromCloud.current = true;
            
            const updatedUserProfile = { ...useAuthStore.getState().userProfile, ...cloudUserProfile };
            const updatedLanguage = sourceData.language || 'pt';

            setFinanceData({
              entries: sourceData.entries || [],
              exits: sourceData.exits || [],
              recurrings: sourceData.recurrings || [],
              purchases: sourceData.purchases || [],
              savingsLogs: sourceData.savingsLogs || {},
              creditCards: sourceData.creditCards || defaultCards,
              installmentStatusMap: sourceData.installmentStatusMap || {},
              savingsGoal: sourceData.savingsGoal || 0,
              language: updatedLanguage,
              lastUpdatedAt: Math.max(cloudTime, localTime)
            });
            
            setUserProfile(updatedUserProfile);
            i18n.changeLanguage(updatedLanguage);
            
            if (sourceData.investmentPortfolio) {
              require('../stores/useInvestmentStore').useInvestmentStore.setState({ portfolio: sourceData.investmentPortfolio });
            }

            // If local was the source, push to cloud so the DB catches up
            if (sourceLabel.startsWith('AsyncStorage') && localData) {
              console.log('[Sync] Local data was used — pushing to cloud...');
              // Wait for state to settle before pushing
              setTimeout(async () => {
                isSyncingFromCloud.current = false;
                await syncToBackendNow(currentUser.uid);
              }, 500);
            } else {
              // Extended delay to prevent accidental overwrites from state-change subscribers
              setTimeout(() => {
                isSyncingFromCloud.current = false;
              }, 2000);
            }

            setSyncStatus('synced');
          } else {
            // New user — no document in the database yet
            // Check if there's local data from AsyncStorage that should be preserved
            const localData = await loadFromAsyncStorage();

            const now = new Date();
            const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            const initialProfile = { ...useAuthStore.getState().userProfile };
            initialProfile.createdAt = currentPeriod;
            initialProfile.status = 'active';
            initialProfile.email = currentUser.email || '';
            initialProfile.activePlan = 'free'; // enforce free

            const emailLower = currentUser.email?.trim().toLowerCase();
            if (emailLower === 'lucaspoletis@gmail.com') {
              initialProfile.role = 'admin';
              initialProfile.activePlan = 'premium';
            } else {
              initialProfile.role = 'user';
            }

            if (currentUser.displayName) {
              const names = currentUser.displayName.trim().split(/\s+/);
              if (names.length > 0) {
                initialProfile.firstName = names[0];
                initialProfile.lastName = names.slice(1).join(' ');
              }
            }
            
            const isGoogleProvider = currentUser.providerData.some(p => p.providerId === 'google.com');
            initialProfile.loginType = isGoogleProvider ? 'google' : 'email';

            setUserProfile(initialProfile);

            // If we have local data, hydrate the store with it before saving to cloud
            if (localData) {
              console.log('[Sync] New cloud doc but found local data — restoring...');
              isSyncingFromCloud.current = true;
              setFinanceData({
                entries: localData.entries || [],
                exits: localData.exits || [],
                recurrings: localData.recurrings || [],
                purchases: localData.purchases || [],
                savingsLogs: localData.savingsLogs || {},
                creditCards: localData.creditCards || defaultCards,
                installmentStatusMap: localData.installmentStatusMap || {},
                savingsGoal: localData.savingsGoal || 0,
                language: localData.language || 'pt',
                lastUpdatedAt: localData.lastUpdatedAt || 0,
              });
              setTimeout(() => {
                isSyncingFromCloud.current = false;
              }, 2000);
            }

            // Create the cloud document with current state
            await syncToBackendNow(currentUser.uid);
            setSyncStatus('synced');
          }
        } catch (err) {
          console.error('Error syncing auth state with backend:', err);
          
          // CRITICAL FALLBACK: If backend fails completely, load from AsyncStorage
          console.log('[Sync] Backend failed — attempting AsyncStorage fallback...');
          const localData = await loadFromAsyncStorage();
          if (localData) {
            isSyncingFromCloud.current = true;
            setFinanceData({
              entries: localData.entries || [],
              exits: localData.exits || [],
              recurrings: localData.recurrings || [],
              purchases: localData.purchases || [],
              savingsLogs: localData.savingsLogs || {},
              creditCards: localData.creditCards || defaultCards,
              installmentStatusMap: localData.installmentStatusMap || {},
              savingsGoal: localData.savingsGoal || 0,
              language: localData.language || 'pt',
              lastUpdatedAt: localData.lastUpdatedAt || 0,
            });
            i18n.changeLanguage(localData.language || 'pt');
            setTimeout(() => {
              isSyncingFromCloud.current = false;
            }, 2000);
            console.log('[Sync] Successfully loaded from AsyncStorage fallback.');
          }
          
          setSyncStatus('error');
        }
      } else {
        setActiveUid(null);
        setSyncStatus('offline');
        
        // Hydrate from AsyncStorage fallback for guest/offline users
        loadFromAsyncStorage().then((localData) => {
          if (localData) {
            isSyncingFromCloud.current = true;
            setFinanceData({
              entries: localData.entries || [],
              exits: localData.exits || [],
              recurrings: localData.recurrings || [],
              purchases: localData.purchases || [],
              savingsLogs: localData.savingsLogs || {},
              creditCards: localData.creditCards || defaultCards,
              installmentStatusMap: localData.installmentStatusMap || {},
              savingsGoal: localData.savingsGoal || 0,
              language: localData.language || 'pt',
              lastUpdatedAt: localData.lastUpdatedAt || 0,
            });
            i18n.changeLanguage(localData.language || 'pt');
            setTimeout(() => {
              isSyncingFromCloud.current = false;
            }, 2000);
          }
        }).catch(err => {
          console.error('[Sync] Error loading AsyncStorage for guest:', err);
        });
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Zustand state changes and push to backend with debounce + retry.
  // IMPORTANT: We capture the UID at the moment the change happens, not when the debounce fires.
  // This prevents data loss if the user logs out before the debounce completes.
  useEffect(() => {
    let capturedUid: string | null = null;

    const handleStateChange = () => {
      const user = useAuthStore.getState().user;
      if (!user) return;
      if (isSyncingFromCloud.current) return;

      // Capture UID NOW, before debounce delay
      capturedUid = user.uid;

      if (pendingSyncTimeout.current) {
        clearTimeout(pendingSyncTimeout.current);
      }

      // Reduced debounce from 500ms to 300ms for faster sync
      pendingSyncTimeout.current = setTimeout(async () => {
        if (!capturedUid) return;
        
        const { setSyncStatus } = useSyncStore.getState();
        setSyncStatus('syncing');
        
        // syncToBackendNow now has built-in retry and validation
        await syncToBackendNow(capturedUid);
        pendingSyncTimeout.current = null;
      }, 300);
    };

    let prevFinanceState = useFinanceStore.getState();
    const unsubFinance = useFinanceStore.subscribe((state) => {
      if (!isSyncingFromCloud.current && (
        state.entries !== prevFinanceState.entries ||
        state.exits !== prevFinanceState.exits ||
        state.recurrings !== prevFinanceState.recurrings ||
        state.purchases !== prevFinanceState.purchases ||
        state.savingsLogs !== prevFinanceState.savingsLogs ||
        state.creditCards !== prevFinanceState.creditCards ||
        state.savingsGoal !== prevFinanceState.savingsGoal ||
        state.language !== prevFinanceState.language ||
        state.installmentStatusMap !== prevFinanceState.installmentStatusMap
      )) {
         handleStateChange();
      }
      prevFinanceState = state;
    });

    let prevAuthState = useAuthStore.getState();
    const unsubAuth = useAuthStore.subscribe((state) => {
      if (state.userProfile !== prevAuthState.userProfile && !isSyncingFromCloud.current) {
         handleStateChange();
      }
      prevAuthState = state;
    });

    // SAFETY NET: Periodic sync every 30 seconds to catch any missed changes
    periodicSyncInterval.current = setInterval(() => {
      const user = useAuthStore.getState().user;
      if (!user || isSyncingFromCloud.current) return;
      
      // Only sync if there's no pending debounce (to avoid double-syncing)
      if (!pendingSyncTimeout.current) {
        syncToBackendNow(user.uid, 1).catch(() => {
          console.warn('[Periodic Sync] Failed silently in background');
        });
      }
    }, 30000);

    return () => {
      if (pendingSyncTimeout.current) {
        clearTimeout(pendingSyncTimeout.current);
      }
      if (periodicSyncInterval.current) {
        clearInterval(periodicSyncInterval.current);
      }
      unsubFinance();
      unsubAuth();
    };
  }, []);
}
