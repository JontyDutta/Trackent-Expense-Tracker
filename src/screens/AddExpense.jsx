import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useExpenseStore } from '../store/useExpenseStore';
import { useSettingsStore } from '../store/useSettingsStore';

export default function AddExpense() {
  const navigate = useNavigate();
  const { categories, addExpense, addCategory, removeCategory } = useExpenseStore();
  const { currency } = useSettingsStore();

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📌');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !categoryId || !date) return;

    addExpense({
      amount: parseFloat(amount),
      categoryId,
      date,
      note,
    });
    navigate('/');
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return;
    
    // Pick a random nice color
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    addCategory({
      name: newCatName,
      icon: newCatIcon,
      color: randomColor,
    });
    
    setIsAddingCategory(false);
    setNewCatName('');
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Expense</h1>
      
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 border border-border flex flex-col gap-8 shadow-sm">
        
        {/* Amount */}
        <div className="flex flex-col items-center justify-center py-6">
          <label className="text-xs font-semibold text-gray-500 dark:text-white uppercase tracking-widest mb-4">Amount</label>
          <div className="flex items-center justify-center relative">
            <span className="text-3xl text-gray-400 font-light mr-2">
              {currency.symbol}
            </span>
            <input 
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-48 bg-transparent text-5xl font-light text-foreground focus:outline-none text-center placeholder:text-gray-300 dark:placeholder:text-gray-700"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-semibold text-gray-500 dark:text-white uppercase tracking-widest">Category</label>
            <button 
              type="button" 
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="text-foreground text-xs font-medium hover:underline underline-offset-2"
            >
              + New Category
            </button>
          </div>
          
          {isAddingCategory ? (
            <div className="bg-secondary/30 p-4 rounded-xl border border-border mb-4 flex flex-col gap-3">
              <div className="flex gap-2 w-full">
                <input 
                  type="text" 
                  value={newCatIcon} 
                  onChange={(e) => setNewCatIcon(e.target.value)} 
                  className="w-10 sm:w-12 bg-card border border-border rounded-md p-2 text-center text-lg focus:outline-none focus:border-gray-400 flex-shrink-0"
                  maxLength={2}
                />
                <input 
                  type="text" 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  className="flex-1 min-w-0 bg-card border border-border rounded-md p-2 text-sm text-foreground focus:outline-none focus:border-gray-400"
                  placeholder="Name"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddCategory}
                className="bg-primary text-white py-2 rounded-md text-sm font-bold"
              >
                Save
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  style={{
                    borderColor: categoryId === cat.id ? cat.color : 'var(--border)',
                    color: categoryId === cat.id ? cat.color : 'inherit',
                    backgroundColor: categoryId === cat.id ? `${cat.color}10` : 'transparent'
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all w-full h-full ${
                    categoryId === cat.id ? 'ring-1 ring-inset ring-current shadow-sm' : 'hover:bg-secondary/50 text-gray-500'
                  }`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className="text-[10px] font-medium text-center truncate w-full">{cat.name}</span>
                </button>
                {/* Delete button (only show on custom categories if we want, or all categories) */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); if(categoryId === cat.id) setCategoryId(''); }}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                  title="Delete category"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-white uppercase tracking-widest mb-2">Date</label>
            <input 
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-transparent border-b border-border text-foreground focus:border-foreground focus:outline-none transition-colors dark:[&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-white uppercase tracking-widest mb-2">Note</label>
            <input 
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2.5 bg-transparent border-b border-border text-foreground focus:border-foreground focus:outline-none transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
              placeholder="Optional description"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full mt-4 bg-primary text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
        >
          Save Expense
        </button>

      </form>
    </div>
  );
}
