import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useExpenseStore } from '../store/useExpenseStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { format, parseISO, isSameMonth, startOfMonth, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, PieChart as PieChartIcon, Trash2, Pencil } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function Dashboard() {
  const { expenses, categories, monthlyBudget, removeExpense, updateExpense, clearAllExpenses } = useExpenseStore();
  const { currency } = useSettingsStore();
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  
  const [editingExpense, setEditingExpense] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount);
    setEditCategory(expense.categoryId);
    setEditNote(expense.note || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    updateExpense(editingExpense.id, {
      amount: parseFloat(editAmount) || 0,
      categoryId: editCategory,
      note: editNote
    });
    setEditingExpense(null);
  };

  // Filter expenses for current viewed month
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => isSameMonth(parseISO(e.date), currentMonth));
  }, [expenses, currentMonth]);

  const totalMonthlySpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by date for Daily View
  const expensesByDate = useMemo(() => {
    const groups = {};
    monthlyExpenses.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.keys(groups).sort((a,b) => new Date(b) - new Date(a)).map(date => ({
      date,
      items: groups[date],
      total: groups[date].reduce((sum, e) => sum + e.amount, 0)
    }));
  }, [monthlyExpenses]);

  // Data for Pie Chart (By Category)
  const categoryData = useMemo(() => {
    const totals = {};
    monthlyExpenses.forEach(e => {
      totals[e.categoryId] = (totals[e.categoryId] || 0) + e.amount;
    });
    return Object.keys(totals).map(catId => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || 'Unknown',
        value: totals[catId],
        color: cat?.color || '#ccc',
        icon: cat?.icon
      };
    }).sort((a,b) => b.value - a.value);
  }, [monthlyExpenses, categories]);

  // Data for Bar Chart (Daily Spending)
  const dailyData = [...expensesByDate].reverse().map(group => ({
    date: format(parseISO(group.date), 'dd MMM'),
    amount: group.total
  }));

  const highestCategory = categoryData[0];
  const averageDaily = dailyData.length ? (totalMonthlySpent / dailyData.length) : 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Header & Month Navigation */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track every penny, beautifully.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 text-gray-400 hover:text-foreground hover:bg-secondary rounded-md transition-colors">
            <ChevronLeft strokeWidth={1.5} size={18} />
          </button>
          <span className="font-medium text-sm w-24 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 text-gray-400 hover:text-foreground hover:bg-secondary rounded-md transition-colors">
            <ChevronRight strokeWidth={1.5} size={18} />
          </button>
        </div>
      </div>

      {/* Budget Alert */}
      {monthlyBudget > 0 && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          totalMonthlySpent >= monthlyBudget 
            ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' 
            : totalMonthlySpent >= monthlyBudget * 0.8
              ? 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300'
              : 'hidden'
        }`}>
          <div className="flex-1">
            <h4 className="font-bold">
              {totalMonthlySpent >= monthlyBudget ? 'Budget Exceeded!' : 'Approaching Budget Limit!'}
            </h4>
            <p className="text-sm">
              You've spent {((totalMonthlySpent / monthlyBudget) * 100).toFixed(1)}% of your {currency.symbol}{monthlyBudget} budget.
            </p>
          </div>
          {/* Progress bar visual */}
          <div className="w-24 h-2 bg-black/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${totalMonthlySpent >= monthlyBudget ? 'bg-red-500' : 'bg-yellow-500'}`}
              style={{ width: `${Math.min((totalMonthlySpent / monthlyBudget) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Month Summary Card */}
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider">Total Spent</p>
            <h2 className="text-5xl font-light tracking-tighter text-foreground">{currency.symbol}{totalMonthlySpent.toFixed(2)}</h2>
          </div>
          <div className="mt-8 flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Avg. Daily</p>
              <p className="font-medium text-foreground">{currency.symbol}{averageDaily.toFixed(2)}</p>
            </div>
            {highestCategory && (
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Top Category</p>
                <p className="font-medium text-foreground">{highestCategory.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm col-span-1 flex flex-col items-center justify-center">
          <h3 className="font-semibold self-start mb-2 w-full flex items-center gap-2"><PieChartIcon size={18}/> Spending by Category</h3>
          {categoryData.length > 0 ? (
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${currency.symbol}${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>

        {/* Daily Bar Chart */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm col-span-1 md:col-span-1 hidden md:flex flex-col">
          <h3 className="font-semibold mb-4 text-sm">Daily Spread</h3>
          {dailyData.length > 0 ? (
            <div className="w-full flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => `${currency.symbol}${value.toFixed(2)}`} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No data</div>
          )}
        </div>

      </div>

      {/* Daily Expense List */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Daily Transactions</h3>
          {expensesByDate.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all expenses? This cannot be undone.')) {
                  clearAllExpenses();
                }
              }}
              className="text-red-500 hover:text-red-600 font-semibold text-sm flex items-center gap-1 transition-colors"
            >
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>
        
        {expensesByDate.length === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
             <p className="text-gray-400 mb-4 text-sm">No expenses found for this month.</p>
             <Link to="/add" className="text-sm text-foreground font-medium underline underline-offset-4 hover:text-gray-500 transition-colors">Add an Expense</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {expensesByDate.map(group => (
              <div key={group.date}>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-border">
                  <h4 className="text-sm font-medium text-gray-500">
                    {format(parseISO(group.date), 'EEEE, dd MMMM')}
                  </h4>
                  <span className="text-sm font-medium text-gray-500">
                    {currency.symbol}{group.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  {group.items.map(expense => {
                    const cat = categories.find(c => c.id === expense.categoryId);
                    return (
                      <div key={expense.id} className="group flex justify-between items-center py-3 border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <div className="flex items-center gap-4 px-2">
                          <div className="text-lg opacity-80" style={{ color: cat?.color }}>
                            {cat?.icon}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cat?.name || 'Unknown'}</p>
                            {expense.note && <p className="text-xs text-gray-400 mt-0.5">{expense.note}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 px-2">
                          <span className="font-medium text-foreground">
                            {currency.symbol}{expense.amount.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleEditClick(expense)}
                              className="text-gray-400 hover:text-blue-500 transition-all focus:opacity-100"
                              title="Edit"
                            >
                              <Pencil size={16} strokeWidth={1.5} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Delete this expense?')) {
                                  removeExpense(expense.id);
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 transition-all focus:opacity-100"
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 md:p-8 shadow-2xl relative border border-border">
            <h2 className="text-xl font-semibold mb-6">Edit Expense</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{currency.symbol}</span>
                  <input 
                    type="number" step="0.01" required
                    value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-transparent border border-border rounded-xl focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
                <select 
                  required
                  value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-transparent border border-border py-2.5 px-3 rounded-xl focus:outline-none focus:border-primary text-foreground"
                >
                  <option value="" disabled className="bg-background text-foreground">Select category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-background text-foreground">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Note (Optional)</label>
                <input 
                  type="text"
                  value={editNote} onChange={(e) => setEditNote(e.target.value)}
                  className="w-full bg-transparent border border-border py-2.5 px-3 rounded-xl focus:outline-none focus:border-primary transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                  placeholder="What was this for?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingExpense(null)} className="flex-1 bg-secondary text-foreground py-2.5 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
