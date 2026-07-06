import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useSettingsStore } from '../store/useSettingsStore';

import { Moon, Sun, Wallet } from 'lucide-react';

export default function Layout() {
  const { theme, toggleTheme } = useSettingsStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle CSS safe area for mobile devices notch (pb-safe in tailwind)
  useEffect(() => {
    if (!document.getElementById('safe-area-style')) {
      const style = document.createElement('style');
      style.id = 'safe-area-style';
      style.innerHTML = `
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .pt-safe { padding-top: env(safe-area-inset-top); }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header / Theme Toggle Container */}
        <header className="flex items-center justify-between p-4 md:px-8 border-b border-border bg-card z-10 pt-safe shrink-0 shadow-sm">
          <div className="flex items-center gap-2 md:hidden">
            <Wallet size={24} className="text-primary" strokeWidth={1.5} />
            <h2 className="font-bold text-xl text-primary">Trackent</h2>
          </div>
          <div className="hidden md:block"></div> {/* Spacer for desktop */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-secondary text-foreground hover:bg-border transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={20} strokeWidth={1.5} /> : <Sun size={20} strokeWidth={1.5} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
