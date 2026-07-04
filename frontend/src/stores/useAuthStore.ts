import { create } from 'zustand';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserProfile } from '../types/user';
import { apiFetch } from '../services/api';

export const ASYNC_STORAGE_KEYS = {
  USER_PROFILE: '@MoneyTree:userProfile',
};

interface AuthState {
  user: User | null;
  userProfile: UserProfile;
  authInitialized: boolean;
  allUsers: any[];
  suspendedMsg: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setAuthInitialized: (initialized: boolean) => void;
  clearSuspendedMsg: () => void;
  setSuspendedMsg: (msg: string | null) => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // Admin
  fetchAllUsers: () => Promise<void>;
  adminUpdateUserPlan: (userId: string, plan: 'free' | 'premium') => Promise<void>;
  adminToggleUserSuspension: (userId: string, currentStatus: 'active' | 'suspended') => Promise<void>;
  adminWipeUserData: (userId: string) => Promise<void>;
}

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  city: '',
  state: '',
  loginType: 'email',
  password: '',
  activePlan: 'free',
  createdAt: (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: defaultProfile,
  authInitialized: false,
  allUsers: [],
  suspendedMsg: null,

  setUser: (user) => set({ user }),
  
  setUserProfile: (profile) => {
    const updated = { ...get().userProfile, ...profile };
    set({ userProfile: updated });
    
    // Auto-sync user profile to Vercel backend immediately to prevent data loss
    const user = get().user;
    if (user) {
      apiFetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updated),
      }).catch(err => {
        console.error('Error instantly saving profile to Vercel:', err);
      });
    }
  },
  
  setAuthInitialized: (authInitialized) => set({ authInitialized }),
  
  clearSuspendedMsg: () => set({ suspendedMsg: null }),
  setSuspendedMsg: (msg) => set({ suspendedMsg: msg }),
  
  logout: async () => {
    try {
      // Sync all data to Vercel BEFORE signing out.
      const uid = get().user?.uid;
      if (uid) {
        const { syncToFirestoreNow } = require('../services/syncFirestore');
        console.log('[Auth] Flushing data to Vercel before logout...');
        await syncToFirestoreNow(uid);
        console.log('[Auth] Data flushed successfully. Proceeding with logout.');

        // Revoke JWT tokens on Vercel backend
        try {
          await apiFetch('/api/auth/logout', { method: 'POST' });
          console.log('[Auth] Backend tokens revoked.');
        } catch (err) {
          console.warn('[Auth] Failed to revoke backend tokens:', err);
        }
      }
      await signOut(auth);
      set({ user: null });
    } catch (err) {
      console.error('Error logging out:', err);
    }
  },
  
  deleteAccount: async () => {
    const user = get().user;
    if (!user) return;
    try {
      // Delete user data on Vercel backend
      await apiFetch('/api/user/profile', { method: 'DELETE' });
      await user.delete();
      set({ user: null });
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        throw new Error('reauth_required');
      }
      console.error('Error deleting account:', err);
      throw err;
    }
  },

  fetchAllUsers: async () => {
    const { userProfile } = get();
    if (userProfile?.role !== 'admin') return;
    try {
      const usersList = await apiFetch('/api/admin/users');
      set({ allUsers: usersList });
    } catch (err) {
      console.error('Error fetching all users:', err);
    }
  },

  adminUpdateUserPlan: async (userId, plan) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        body: JSON.stringify({ activePlan: plan }),
      });
      
      if (userId === get().user?.uid) {
        get().setUserProfile({ activePlan: plan });
      }
      await get().fetchAllUsers();
    } catch (err) {
      console.error('Error in adminUpdateUserPlan:', err);
      throw err;
    }
  },

  adminToggleUserSuspension: async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await apiFetch(`/api/admin/users/${userId}/suspension`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      await get().fetchAllUsers();
    } catch (err) {
      console.error('Error in adminToggleUserSuspension:', err);
      throw err;
    }
  },

  adminWipeUserData: async (userId) => {
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      await get().fetchAllUsers();
    } catch (err) {
      console.error('Error in adminWipeUserData:', err);
      throw err;
    }
  },
}));
