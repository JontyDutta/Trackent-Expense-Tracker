import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Users, Settings } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { name: 'Home', path: '/', icon: <LayoutDashboard strokeWidth={1.5} size={22} /> },
    { name: 'Add', path: '/add', icon: <PlusCircle strokeWidth={1.5} size={22} /> },
    { name: 'Groups', path: '/groups', icon: <Users strokeWidth={1.5} size={22} /> },
    { name: 'Settings', path: '/settings', icon: <Settings strokeWidth={1.5} size={22} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-card border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive 
                  ? 'text-primary font-bold' 
                  : 'text-gray-400 hover:text-foreground'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px]">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
