import { initializeApp, getApps, getApp } from 'firebase/app';
import * as authMethods from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { FirebaseConfig } from '../constants/FirebaseConfig';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(FirebaseConfig) : getApp();

// Initialize Auth dynamically based on platform
let auth: authMethods.Auth;
if (Platform.OS === 'web') {
  auth = authMethods.getAuth(app);
} else {
  // Avoid multi-initialization errors in React Native
  try {
    auth = authMethods.getAuth(app);
  } catch {
    const getReactNativePersistence = (authMethods as any).getReactNativePersistence;
    auth = (authMethods as any).initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
}

const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});

export { app, auth, db };
