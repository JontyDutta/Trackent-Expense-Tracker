import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  session: null,
  user: null,
  loading: true,
  
  setSession: (session) => set({ 
    session, 
    user: session?.user || null,
    loading: false
  }),
  signInAsGuest: () => {
    set({ 
      session: { user: { id: 'guest', email: 'guest@trackent.local' } }, 
      user: { id: 'guest', email: 'guest@trackent.local' },
      loading: false
    });
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('trackent-expense-storage');
    localStorage.removeItem('trackent-groups');
    set({ session: null, user: null });
  }
}));
