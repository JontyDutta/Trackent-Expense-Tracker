import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useExpenseStore } from '../store/useExpenseStore';
import { CURRENCIES } from '../constants';
import { Moon, Sun, Info, ShieldAlert, Trash2 } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme, currency, setCurrency } = useSettingsStore();
  const { monthlyBudget, setMonthlyBudget, expenses, categories, clearAllExpenses } = useExpenseStore();
  
  const [budgetInput, setBudgetInput] = useState(monthlyBudget || '');
  const [showAbout, setShowAbout] = useState(false);

  const handleSaveBudget = (e) => {
    e.preventDefault();
    setMonthlyBudget(parseFloat(budgetInput) || 0);
  };



  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Settings</h1>
      
      {/* General Settings */}
      <div className="bg-card rounded-2xl shadow-sm border border-border flex flex-col">
        
        {/* Theme Toggle was moved to header */}

        {/* Currency Selector */}
        <div className="p-6 md:px-8 flex items-center justify-between border-b border-border/50">
          <div>
            <h3 className="font-medium text-foreground">Currency</h3>
            <p className="text-sm text-gray-500 mt-1">Select default currency.</p>
          </div>
          <select 
            value={currency.code} 
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-secondary/50 text-foreground rounded-lg py-2 px-3 border border-border outline-none focus:border-foreground transition-colors text-sm"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Setting */}
        <div className="p-6 md:px-8 border-b border-border/50">
          <div className="mb-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <ShieldAlert strokeWidth={1.5} size={18} /> Monthly Budget
            </h3>
            <p className="text-sm text-gray-500 mt-1">Set a global monthly budget to receive alerts.</p>
          </div>
          <form onSubmit={handleSaveBudget} className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{currency.symbol}</span>
              <input 
                type="number" step="0.01" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-transparent border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                placeholder="No budget set"
              />
            </div>
            <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold">Save</button>
          </form>
        </div>

        {/* About App */}
        <div className="p-6 md:px-8 flex items-center justify-between border-b border-border/50">
          <div>
            <h3 className="font-medium text-foreground">About Trackent</h3>
            <p className="text-sm text-gray-500 mt-1">App version and developer info.</p>
          </div>
          <button onClick={() => setShowAbout(true)} className="flex items-center gap-2 text-foreground px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary/50 transition-colors text-sm">
            <Info strokeWidth={1.5} size={16} /> Info
          </button>
        </div>

        {/* Dangerous Zone */}
        <div className="p-6 md:px-8 bg-red-500/5 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
              <p className="text-sm text-gray-500 mt-1">Permanently delete all your expense data.</p>
            </div>
            <button 
              onClick={() => {
                if (window.confirm('CRITICAL: This will permanently delete ALL your expenses. Are you absolutely sure?')) {
                  clearAllExpenses();
                  alert('All data has been cleared.');
                }
              }}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap"
            >
              <Trash2 strokeWidth={1.5} size={18} /> Delete All Data
            </button>
          </div>
        </div>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-8 shadow-2xl relative border border-border">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Trackent.</h2>
            <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">Version 1.0.0</p>
            <p className="text-sm mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
              Trackent is a smart, minimalist personal finance tracker that helps you monitor daily and monthly expenses, split group bills, set budgets, and visualize your spending — beautifully.
            </p>
            <div className="bg-secondary/30 p-4 rounded-xl mb-8 border border-border/50">
              <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Developer</p>
              <p className="font-medium text-foreground">Jonty Dutta</p>
              <a href="mailto:jonty.duttanspa@gmail.com" className="text-foreground text-sm font-medium hover:underline mt-1 inline-block">
                jonty.duttanspa@gmail.com
              </a>
            </div>
            <button 
              onClick={() => setShowAbout(false)}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
