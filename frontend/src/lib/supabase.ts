import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

// Hardcoded to true so Docker cannot strip it out
export const isLocalAuthMode = true;

let client = createClient(supabaseUrl, supabaseAnonKey);

if (isLocalAuthMode) {
  console.log("⚠️ Running in Local/No-Auth Mode: Dev Credentials Active");

  let isMockSignedIn = false;
  const mockUser = { id: 'dev-123', email: 'test@langscope.dev', role: 'admin' };
  const mockSession = { access_token: 'mock-jwt-token', user: mockUser };
  const listeners = new Set<Function>();

  client = {
    ...client,
    auth: {
      ...client.auth,
      
      getSession: async () => ({
        data: { session: isMockSignedIn ? mockSession : null },
        error: null
      }),

      // NEW: Added getUser interceptor. Most modern React apps use this for route guards!
      getUser: async () => ({
        data: { user: isMockSignedIn ? mockUser : null },
        error: null
      }),
      
      onAuthStateChange: (callback: any) => {
        listeners.add(callback);
        callback(isMockSignedIn ? 'SIGNED_IN' : 'INITIAL_SESSION', isMockSignedIn ? mockSession : null);
        return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
      },
      
      signInWithPassword: async ({ email, password }: any) => {
        if (email === 'test@langscope.dev' && password === 'TestPassword123!') {
          isMockSignedIn = true;
          listeners.forEach(cb => cb('SIGNED_IN', mockSession));
          return { data: { user: mockUser, session: mockSession }, error: null };
        }
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      },
      
      signOut: async () => {
        isMockSignedIn = false;
        listeners.forEach(cb => cb('SIGNED_OUT', null));
        return { error: null };
      }
    }
  } as any;
}

export const supabase = client;