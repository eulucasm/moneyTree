import axios from 'axios';
import { auth } from '../config/firebase';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Firebase JWT token
apiClient.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
