// Final mock to satisfy all imports in authStore.ts
export const isLocalAuthMode = true;

export const supabase = {
  auth: {
    onAuthStateChange: () => ({ 
      data: { subscription: { unsubscribe: () => {} } } 
    }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
};

export default supabase;