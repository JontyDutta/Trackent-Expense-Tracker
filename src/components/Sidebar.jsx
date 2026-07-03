import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, Settings, Wallet, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Sidebar() {
  const { user, signOut } = useAuthStore();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard strokeWidth={1.5} size={20} /> },
    { name: 'Add Expense', path: '/add', icon: <PlusCircle strokeWidth={1.5} size={20} /> },
    { name: 'Groups', path: '/groups', icon: <Users strokeWidth={1.5} size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings strokeWidth={1.5} size={20} /> },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r border-border h-full p-6">
      <div className="flex items-center gap-3 mb-12 px-2">
        <Wallet strokeWidth={1.5} size={28} className="text-primary" />
        <span className="font-medium text-xl tracking-tighter text-foreground">Trackent.</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                isActive 
                  ? 'text-primary font-bold bg-primary/10' 
                  : 'text-gray-500 hover:text-foreground hover:bg-secondary/30'
              }`
            }
          >
            {item.icon}
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto pb-4 px-2">
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
            Track Every Penny
          </p>
          <p className="text-sm font-bold text-foreground truncate">
            {user?.email || "Not signed in"}
          </p>
        </div>
        <button 
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-foreground hover:bg-red-500/10 hover:text-red-500 py-2.5 rounded-xl font-medium transition-colors text-sm mb-4"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </button>
        <p className="text-[10px] text-center text-gray-500 dark:text-gray-400/80 uppercase tracking-widest font-semibold">
          Develop by Jonty Dutta
        </p>
      </div>
    </div>
  );
}
