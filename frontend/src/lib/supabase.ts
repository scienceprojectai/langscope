import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

export const isLocalAuthMode = 'true';

let client = createClient(supabaseUrl, supabaseAnonKey);

if (isLocalAuthMode) {
  console.log("⚠️ Running in Local/No-Auth Mode: Dev Credentials Active");

  // Local state to track if you have typed the password yet
  let isMockSignedIn = false;
  
  // The dev credentials you requested
  const mockUser = { id: 'dev-123', email: 'test@langscope.dev', role: 'admin' };
  const mockSession = { access_token: 'mock-jwt-token', user: mockUser };
  
  // Keep track of React components listening for auth changes
  const listeners = new Set<Function>();

  client = {
    ...client,
    auth: {
      ...client.auth,
      
      // 1. Initial check (starts as null so the login screen shows)
      getSession: async () => ({
        data: { session: isMockSignedIn ? mockSession : null },
        error: null
      }),
      
      // 2. Event listener for your React Contexts
      onAuthStateChange: (callback: any) => {
        listeners.add(callback);
        // Fire the initial state when the app loads
        callback(isMockSignedIn ? 'SIGNED_IN' : 'INITIAL_SESSION', isMockSignedIn ? mockSession : null);
        return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
      },
      
      // 3. Intercept the actual login button click
      signInWithPassword: async ({ email, password }: any) => {
        if (email === 'test@langscope.dev' && password === 'TestPassword123!') {
          isMockSignedIn = true;
          // Tell React the user just logged in so it redirects to the dashboard
          listeners.forEach(cb => cb('SIGNED_IN', mockSession));
          return { data: { user: mockUser, session: mockSession }, error: null };
        }
        // Simulate a real Supabase error for wrong passwords
        return { 
          data: { user: null, session: null }, 
          error: { message: 'Invalid login credentials' } 
        };
      },
      
      // 4. Make the logout button work
      signOut: async () => {
        isMockSignedIn = false;
        listeners.forEach(cb => cb('SIGNED_OUT', null));
        return { error: null };
      }
    }
  } as any;
}

export const supabase = client;