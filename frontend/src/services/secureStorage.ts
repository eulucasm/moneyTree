import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * A wrapper for SecureStore with a fallback to AsyncStorage on Web.
 * SecureStore is only available on iOS and Android.
 */
export const secureStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn(`SecureStore failed to read ${key}, falling back to AsyncStorage`, e);
      return AsyncStorage.getItem(key);
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn(`SecureStore failed to write ${key}, falling back to AsyncStorage`, e);
      return AsyncStorage.setItem(key, value);
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
