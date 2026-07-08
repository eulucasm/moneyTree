import { apiFetch } from './api';

/**
 * Validates that the current state has meaningful data before allowing a sync push.
 * Returns true if the state is safe to push (has at least some data).
 */
function hasFinancialData(fState: any): boolean {
  return (
    (fState.entries && fState.entries.length > 0) ||
    (fState.exits && fState.exits.length > 0) ||
    (fState.recurrings && fState.recurrings.length > 0) ||
    (fState.purchases && fState.purchases.length > 0) ||
    (fState.creditCards && fState.creditCards.length > 0)
  );
}

/**
 * Pushes the FULL current Zustand state to the Express backend immediately.
 * Includes validation to prevent empty-state overwrites and retry logic.
 *
 * @param capturedUid - Optional pre-captured UID (used during logout/beforeunload)
 * @param retries - Number of retry attempts remaining (default 3)
 */
export async function syncToBackendNow(capturedUid?: string, retries = 3): Promise<void> {
  const { useAuthStore } = require('../stores/useAuthStore');
  const { useFinanceStore } = require('../stores/useFinanceStore');
  const { useSyncStore } = require('../hooks/useGlobalSync');

  const uid = capturedUid || useAuthStore.getState().user?.uid;
  if (!uid) {
    console.warn('[Sync] syncToBackendNow called with no UID — skipping.');
    useSyncStore.getState().setSyncStatus('synced');
    return;
  }

  const fState = useFinanceStore.getState();
  const aState = useAuthStore.getState();

  // GUARD: Never push an empty state that would overwrite real data in the DB
  if (!hasFinancialData(fState)) {
    console.warn('[Sync] Skipping sync — local state has no financial data (would overwrite DB).');
    useSyncStore.getState().setSyncStatus('synced');
    return;
  }

  const newTimestamp = Date.now();
  const iState = require('../stores/useInvestmentStore').useInvestmentStore.getState();

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
    investmentPortfolio: iState.portfolio,
    updatedAt: newTimestamp
  };

  try {
    useSyncStore.getState().setSyncStatus('syncing');

    await apiFetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify(statePayload),
    });

    useFinanceStore.setState({ lastUpdatedAt: newTimestamp });
    useSyncStore.getState().setSyncStatus('synced');
    console.log('[Sync] ✅ Successfully synced to backend at', new Date(newTimestamp).toISOString());
  } catch (err: any) {
    // If backend rejected because of empty overwrite protection, don't retry
    if (err.message && err.message.includes('Empty state rejected')) {
      console.warn('[Sync] Backend rejected empty overwrite — not retrying.');
      useSyncStore.getState().setSyncStatus('synced'); // Not an error, just a safety block
      return;
    }

    console.error(`[Sync] ❌ Error syncing to backend (retries left: ${retries - 1}):`, err);

    if (retries > 1) {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, 3 - retries) * 1000;
      console.log(`[Sync] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return syncToBackendNow(capturedUid, retries - 1);
    }

    useSyncStore.getState().setSyncStatus('error');
  }
}

/**
 * Builds a JSON payload string for use with navigator.sendBeacon() on web.
 * This is a last-resort sync mechanism for when the page is being unloaded.
 */
export function buildBeaconPayload(): string | null {
  const { useAuthStore } = require('../stores/useAuthStore');
  const { useFinanceStore } = require('../stores/useFinanceStore');

  const fState = useFinanceStore.getState();
  const aState = useAuthStore.getState();

  if (!hasFinancialData(fState)) return null;

  return JSON.stringify({
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
    updatedAt: Date.now()
  });
}
