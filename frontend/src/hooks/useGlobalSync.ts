import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { auth } from '../services/firebase';
import { useAuthStore, ASYNC_STORAGE_KEYS as AUTH_KEYS } from '../stores/useAuthStore';
import { useFinanceStore, FINANCE_STORAGE_KEYS, defaultCards } from '../stores/useFinanceStore';
import { syncToFirestoreNow } from '../services/syncFirestore';
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
 * Loads finance data from AsyncStorage as a fallback when Firestore is unavailable.
 * Returns the data object or null if nothing is found.
 */
async function loadFromAsyncStorage(): Promise<Record<string, any> | null> {
  try {
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
      const val = await AsyncStorage.getItem(key);
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

  // Register beforeunload handler on web to flush pending changes
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Capture UID before it might be cleared
      const uid = useAuthStore.getState().user?.uid;
      if (uid && pendingSyncTimeout.current) {
        // Cancel debounced sync and do immediate sync
        clearTimeout(pendingSyncTimeout.current);
        pendingSyncTimeout.current = null;
        // Best-effort sync — browser may not wait for this
        syncToFirestoreNow(uid).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Main auth state listener — loads data from Firestore (or AsyncStorage fallback) on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const { setUser, setUserProfile, setAuthInitialized, setSuspendedMsg, logout } = useAuthStore.getState();
      const { setFinanceData } = useFinanceStore.getState();
      const { setSyncStatus } = useSyncStore.getState();

      setUser(currentUser);
      
      if (currentUser) {
        setSyncStatus('syncing');

        // Self-heal local state instantly for admins, in case they are offline
        const emailLower = currentUser.email?.trim().toLowerCase();
        if (emailLower === 'eulucasm@icloud.com' || emailLower === 'lucaspoletis@gmail.com') {
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
            if (emailLower === 'eulucasm@icloud.com' || emailLower === 'lucaspoletis@gmail.com') {
              cloudUserProfile.role = 'admin';
            }

            const cloudTime = cloudData.updatedAt || 0;
            
            // Load local data to compare timestamps
            const localData = await loadFromAsyncStorage();
            const localTime = localData?.lastUpdatedAt || 0;

            // Use whichever source has the most recent data
            const sourceData = (localTime > cloudTime && localData) ? localData : cloudData;
            const sourceLabel = (localTime > cloudTime && localData) ? 'AsyncStorage' : 'Firestore';
            
            console.log(`[Sync] Loading data from ${sourceLabel} (cloud: ${cloudTime}, local: ${localTime})`);

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

            // If local was newer, push to Firestore immediately so cloud catches up
            if (localTime > cloudTime && localData) {
              console.log('[Sync] Local data is newer — pushing to Firestore...');
              await syncToFirestoreNow(currentUser.uid);
            }

            // Small delay to let state settle before allowing local writes to trigger sync
            setTimeout(() => {
              isSyncingFromCloud.current = false;
            }, 300);

            setSyncStatus('synced');
          } else {
            // New user — no document in Firestore yet
            // Check if there's local data from AsyncStorage that should be preserved
            const localData = await loadFromAsyncStorage();

            const now = new Date();
            const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            const initialProfile = { ...useAuthStore.getState().userProfile };
            initialProfile.createdAt = currentPeriod;
            initialProfile.status = 'active';
            initialProfile.email = currentUser.email || '';

            const emailLower = currentUser.email?.trim().toLowerCase();
            if (emailLower === 'eulucasm@icloud.com' || emailLower === 'lucaspoletis@gmail.com') {
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
              const isGoogleProvider = currentUser.providerData.some(p => p.providerId === 'google.com');
              if (isGoogleProvider) {
                initialProfile.loginType = 'google';
              }
            }

            setUserProfile(initialProfile);

            // If we have local data, hydrate the store with it before saving to Firestore
            if (localData) {
              console.log('[Sync] New Firestore doc but found local data — restoring...');
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
              }, 300);
            }

            // Create the Firestore document with current state
            await syncToFirestoreNow(currentUser.uid);
            setSyncStatus('synced');
          }
        } catch (err) {
          console.error('Error syncing auth state with Firestore:', err);
          
          // CRITICAL FALLBACK: If Firestore fails completely, load from AsyncStorage
          console.log('[Sync] Firestore failed — attempting AsyncStorage fallback...');
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
            }, 300);
            console.log('[Sync] Successfully loaded from AsyncStorage fallback.');
          }
          
          setSyncStatus('error');
        }
      } else {
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
            }, 300);
          }
        }).catch(err => {
          console.error('[Sync] Error loading AsyncStorage for guest:', err);
        });
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Zustand state changes and push to Firestore with debounce.
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

      pendingSyncTimeout.current = setTimeout(async () => {
        if (!capturedUid) return;
        
        const { setSyncStatus } = useSyncStore.getState();
        setSyncStatus('syncing');
        
        await syncToFirestoreNow(capturedUid);
        pendingSyncTimeout.current = null;
      }, 500);
    };

    const unsubFinance = useFinanceStore.subscribe((state, prevState) => {
      if (!isSyncingFromCloud.current && (
        state.entries !== prevState.entries ||
        state.exits !== prevState.exits ||
        state.recurrings !== prevState.recurrings ||
        state.purchases !== prevState.purchases ||
        state.savingsLogs !== prevState.savingsLogs ||
        state.creditCards !== prevState.creditCards ||
        state.savingsGoal !== prevState.savingsGoal ||
        state.language !== prevState.language ||
        state.installmentStatusMap !== prevState.installmentStatusMap
      )) {
         handleStateChange();
      }
    });

    const unsubAuth = useAuthStore.subscribe((state, prevState) => {
      if (state.userProfile !== prevState.userProfile && !isSyncingFromCloud.current) {
         handleStateChange();
      }
    });

    return () => {
      if (pendingSyncTimeout.current) {
        clearTimeout(pendingSyncTimeout.current);
      }
      unsubFinance();
      unsubAuth();
    };
  }, []);
}
