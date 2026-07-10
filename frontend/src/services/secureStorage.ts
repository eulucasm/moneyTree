import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import CryptoJS from 'crypto-js';

// Simple fixed key for local storage obfuscation to mitigate generic XSS scrapers
const LOCAL_ENCRYPTION_KEY = process.env.EXPO_PUBLIC_LOCAL_ENC_KEY || 'mt-verde-co-secure-local-vault-key-2026';

const encryptData = (data: string): string => {
  try {
    return CryptoJS.AES.encrypt(data, LOCAL_ENCRYPTION_KEY).toString();
  } catch (e) {
    console.error('Encryption failed:', e);
    return data;
  }
};

const decryptData = (cipherText: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, LOCAL_ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || cipherText; // Fallback if it wasn't encrypted
  } catch (e) {
    return cipherText;
  }
};

/**
 * A wrapper for SecureStore with an Encrypted fallback to AsyncStorage on Web.
 * Prevents plain-text storage of financial data in localStorage.
 */
export const secureStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      const encrypted = await AsyncStorage.getItem(key);
      if (!encrypted) return null;
      return decryptData(encrypted);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn(`SecureStore failed to read ${key}, falling back to AsyncStorage`, e);
      const val = await AsyncStorage.getItem(key);
      return val ? decryptData(val) : null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      const encrypted = encryptData(value);
      return AsyncStorage.setItem(key, encrypted);
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn(`SecureStore failed to write ${key}, falling back to AsyncStorage`, e);
      return AsyncStorage.setItem(key, encryptData(value));
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn(`SecureStore failed to delete ${key}, falling back to AsyncStorage`, e);
      return AsyncStorage.removeItem(key);
    }
  }
};
