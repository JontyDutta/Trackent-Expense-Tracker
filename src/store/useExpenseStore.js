import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { DEFAULT_CATEGORIES } from '../constants';
import { useAuthStore } from './useAuthStore';

export const useExpenseStore = create(
  persist(
    (set, get) => ({
  expenses: [],
  categories: [...DEFAULT_CATEGORIES],
  monthlyBudget: 0,
  categoryBudgets: {},
  loading: false,

  fetchData: async () => {
    set({ loading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const [expensesRes, categoriesRes] = await Promise.all([
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('categories').select('*').order('created_at', { ascending: true })
      ]);

      if (expensesRes.error) throw expensesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      // Merge default categories with custom fetched categories
      const fetchedCategories = categoriesRes.data || [];
      const mergedCategories = [...DEFAULT_CATEGORIES, ...fetchedCategories];

      set({ 
        expenses: (expensesRes.data || []).map(e => ({
          ...e,
          amount: Number(e.amount),
          categoryId: e.category
        })),
        categories: mergedCategories
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      set({ loading: false });
    }
  },

  addExpense: async (expense) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    const newId = Date.now().toString();
    const optimisticExpense = { ...expense, id: newId, user_id: user.id };
    
    set((state) => ({
      expenses: [optimisticExpense, ...state.expenses]
    }));

    try {
      const dbExpense = {
        amount: expense.amount,
        category: expense.categoryId || expense.category,
        date: expense.date,
        note: expense.note || '',
        user_id: user.id
      };

      const { data, error } = await supabase.from('expenses').insert(dbExpense).select().single();
      
      if (error) throw error;
      
      // Update with real DB ID
      set((state) => ({
        expenses: state.expenses.map(e => e.id === newId ? {
          ...data,
          amount: Number(data.amount),
          categoryId: data.category
        } : e)
      }));
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Database error: " + (error.message || JSON.stringify(error)));
      // Revert optimistic update on failure
      set((state) => ({
        expenses: state.expenses.filter(e => e.id !== newId)
      }));
    }
  },

  removeExpense: async (id) => {
    // Optimistic update
    const previousExpenses = get().expenses;
    set((state) => ({
      expenses: state.expenses.filter(e => e.id !== id)
    }));

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting expense:", error);
      // Revert
      set({ expenses: previousExpenses });
    }
  },

  updateExpense: async (id, updatedData) => {
    const previousExpenses = get().expenses;
    set((state) => ({
      expenses: state.expenses.map(e => e.id === id ? { ...e, ...updatedData } : e)
    }));

    try {
      const dbExpense = {};
      if (updatedData.amount !== undefined) dbExpense.amount = updatedData.amount;
      if (updatedData.categoryId !== undefined) dbExpense.category = updatedData.categoryId;
      if (updatedData.note !== undefined) dbExpense.note = updatedData.note;

      const { error } = await supabase.from('expenses').update(dbExpense).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Database error: " + (error.message || JSON.stringify(error)));
      set({ expenses: previousExpenses });
    }
  },

  clearAllExpenses: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const previousExpenses = get().expenses;
    set({ expenses: [] });

    try {
      const { error } = await supabase.from('expenses').delete().eq('user_id', user.id);
      if (error) throw error;
    } catch (error) {
      console.error("Error clearing expenses:", error);
      alert("Database error: " + (error.message || JSON.stringify(error)));
      set({ expenses: previousExpenses });
    }
  },

  addCategory: async (category) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const newId = `cat_custom_${Date.now()}`;
    const optimisticCat = { ...category, id: newId };
    
    set((state) => ({
      categories: [...state.categories, optimisticCat]
    }));

    try {
      const { data, error } = await supabase.from('categories').insert({
        name: category.name,
        user_id: user.id
      }).select().single();

      if (error) throw error;

      set((state) => ({
        categories: state.categories.map(c => c.id === newId ? { ...data, color: category.color, icon: category.icon } : c)
      }));
    } catch (error) {
      console.error("Error adding category:", error);
      set((state) => ({
        categories: state.categories.filter(c => c.id !== newId)
      }));
    }
  },

  removeCategory: async (id) => {
    // If it's a default category, we don't delete from DB
    if (!id.includes('-')) {
       // local custom fallback if not uuid, but in supabase id is UUID (contains hyphens)
    }

    const previousCategories = get().categories;
    set((state) => ({
      categories: state.categories.filter(c => c.id !== id)
    }));

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting category:", error);
      set({ categories: previousCategories });
    }
  },

  // Budget state is kept in memory for now (will reset on reload unless we persist it)
  setMonthlyBudget: (amount) => set(() => ({ monthlyBudget: amount })),
  setCategoryBudget: (categoryId, amount) => set((state) => ({
    categoryBudgets: { ...state.categoryBudgets, [categoryId]: amount }
  })),
    }),
    {
      name: 'trackent-expense-storage',
      partialize: (state) => ({ 
        monthlyBudget: state.monthlyBudget,
        categoryBudgets: state.categoryBudgets 
      }),
    }
  )
);
