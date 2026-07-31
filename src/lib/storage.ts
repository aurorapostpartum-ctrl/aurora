import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface KeyValueStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// expo-router's static web export renders the app in Node (no `window`/`localStorage`),
// so the storage adapter must no-op there instead of using AsyncStorage's browser-only shim.
const webStorage: KeyValueStorage = {
  getItem: (key) =>
    Promise.resolve(typeof localStorage === 'undefined' ? null : localStorage.getItem(key)),
  setItem: (key, value) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export const storage: KeyValueStorage = Platform.OS === 'web' ? webStorage : AsyncStorage;
