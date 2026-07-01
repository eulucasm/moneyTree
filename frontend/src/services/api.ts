import { auth } from './firebase';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
  }
  return __DEV__ ? 'http://localhost:3000' : 'https://moneytree-backend.vercel.app';
};

export const API_BASE_URL = getBaseUrl();

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const user = auth.currentUser;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  } as Record<string, string>;

  if (user) {
    try {
      const token = await user.getIdToken(true);
      headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.warn('[API] Failed to get Firebase ID token:', err);
    }
  } else {
    // Fallback to mock token in Dev Mode if running on localhost and not logged in
    const isLocal = typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (__DEV__ || isLocal) {
      headers['Authorization'] = 'Bearer mock-uid-lucas';
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP Error ${response.status}`);
  }

  return response.json();
};
