import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key in app config')
}

// Storage adapter that works on mobile AND web
const storage = Platform.OS === 'web' 
  ? {
      // Web: Use localStorage
      getItem: async (key: string) => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(key)
      },
      setItem: async (key: string, value: string) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(key, value)
      },
      removeItem: async (key: string) => {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(key)
      },
    }
  : AsyncStorage  // Mobile: Use AsyncStorage

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,  // ← Cross-platform storage!
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
// ```

// ---

// ## **🎯 Why This Works for Login**

// When a user logs in:

// ### **On Mobile (iOS/Android):**
// ```
// User logs in
//   ↓
// Supabase stores auth token
//   ↓
// Uses AsyncStorage.setItem('supabase.auth.token', token)
//   ↓
// Token saved to device
//   ↓
// User stays logged in (even after closing app)
// ```

// ### **On Web (Browser):**
// ```
// User logs in
//   ↓
// Supabase stores auth token
//   ↓
// Uses localStorage.setItem('supabase.auth.token', token)
//   ↓
// Token saved to browser
//   ↓
// User stays logged in (even after closing tab)