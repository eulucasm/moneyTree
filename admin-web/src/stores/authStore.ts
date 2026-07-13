import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import apiClient from '../api/client';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  init: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  init: () => {
    onAuthStateChanged(auth, async (user) => {
      console.log('AuthStateChanged:', user?.uid);
      if (user) {
        set({ loading: true });
        try {
          // Verify if user is admin via our backend
          const res = await apiClient.get('/api/user/profile');
          console.log('Profile Response:', res.data);
          
          if (res.data?.role === 'admin') {
            set({ user, isAdmin: true, loading: false });
          } else {
            // Not an admin, sign out immediately
            await signOut(auth);
            set({ user: null, isAdmin: false, loading: false });
            alert(`Acesso negado. Seu perfil é '${res.data?.role}', mas é necessário ser 'admin'.`);
          }
        } catch (error: any) {
          console.error('Auth verification error:', error);
          await signOut(auth);
          set({ user: null, isAdmin: false, loading: false });
          alert(`Erro ao validar permissões: ${error.message}`);
        }
      } else {
        set({ user: null, isAdmin: false, loading: false });
      }
    });
  },
  logout: async () => {
    await signOut(auth);
  }
}));
