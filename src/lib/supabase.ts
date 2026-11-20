import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as ExpoCrypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (Platform.OS !== 'web' && !globalThis.crypto?.subtle) {
  const currentCrypto = globalThis.crypto;
  const subtle = {
    digest: (algorithm: AlgorithmIdentifier, data: BufferSource) => {
      const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
      return ExpoCrypto.digest(name as ExpoCrypto.CryptoDigestAlgorithm, data);
    },
  };

  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: {
      getRandomValues: currentCrypto?.getRandomValues?.bind(currentCrypto) ?? ExpoCrypto.getRandomValues,
      subtle,
    },
  });
}

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
    auth: {
      storage: Platform.OS === 'web' ? AsyncStorage : secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Add your Supabase URL and publishable key to .env.local, then restart the app.');
  }

  return supabase;
}
