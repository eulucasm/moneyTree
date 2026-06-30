import { apiFetch } from './api';

/**
 * Pushes the FULL current Zustand state to the Express backend immediately.
 * Retains the name syncToFirestoreNow for backwards compatibility with existing file references.
 */
export async function syncToFirestoreNow(capturedUid?: string): Promise<void> {
  const { useAuthStore } = require('../stores/useAuthStore');
  const { useFinanceStore } = require('../stores/useFinanceStore');
  const { useSyncStore } = require('../hooks/useGlobalSync');

  const uid = capturedUid || useAuthStore.getState().user?.uid;
  if (!uid) {
    console.warn('[Sync] syncToBackendNow called with no UID — skipping.');
    return;
  }

  try {
    const fState = useFinanceStore.getState();
    const aState = useAuthStore.getState();
    const newTimestamp = Date.now();

    const statePayload = {
      entries: fState.entries,
      exits: fState.exits,
      recurrings: fState.recurrings,
      purchases: fState.purchases,
      savingsLogs: fState.savingsLogs,
      creditCards: fState.creditCards,
      language: fState.language,
      savingsGoal: fState.savingsGoal,
      userProfile: aState.userProfile,
      installmentStatusMap: fState.installmentStatusMap,
      updatedAt: newTimestamp
    };

    useSyncStore.getState().setSyncStatus('syncing');

    await apiFetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify(statePayload),
    });

    useFinanceStore.setState({ lastUpdatedAt: newTimestamp });
    useSyncStore.getState().setSyncStatus('synced');
    console.log('[Sync] Successfully synced to Vercel Backend at', new Date(newTimestamp).toISOString());
  } catch (err) {
    console.error('[Sync] Error syncing to Vercel Backend:', err);
    useSyncStore.getState().setSyncStatus('error');
  }
}
