import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

export const mmkv = new MMKV({ id: 'app-storage' });

export const secureStorage = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'instagram-clone-secret-key',
});

export const zustandMMKVStorage: StateStorage = {
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    mmkv.delete(name);
  },
};

export const secureZustandMMKVStorage: StateStorage = {
  setItem: (name, value) => {
    secureStorage.set(name, value);
  },
  getItem: (name) => {
    const value = secureStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    secureStorage.delete(name);
  },
};

export function setItem<T>(key: string, value: T): void {
  mmkv.set(key, JSON.stringify(value));
}

export function getItem<T>(key: string): T | null {
  const raw = mmkv.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function deleteItem(key: string): void {
  mmkv.delete(key);
}

export function setSecureItem<T>(key: string, value: T): void {
  secureStorage.set(key, JSON.stringify(value));
}

export function getSecureItem<T>(key: string): T | null {
  const raw = secureStorage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function deleteSecureItem(key: string): void {
  secureStorage.delete(key);
}
