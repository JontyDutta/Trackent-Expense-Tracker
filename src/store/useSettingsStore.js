import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CURRENCIES } from '../constants';

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' or 'dark'
      currency: CURRENCIES[0], // default USD
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setCurrency: (currencyCode) => set(() => ({
        currency: CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
      })),
    }),
    {
      name: 'trackent-settings',
    }
  )
);
