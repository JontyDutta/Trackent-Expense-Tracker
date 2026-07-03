import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGroupStore = create(
  persist(
    (set) => ({
      groups: [], // { id, name, members: [{id, name}] }
      groupExpenses: [], // { id, groupId, title, amount, paidBy(memberId), splitMethod('equal'|'percentage'|'custom'), splitDetails: {}, date, proofBase64 }
      settlements: [], // { id, groupId, fromAmount, toAmount, fromId, toId, date }

      addGroup: (group) => set((state) => ({
        groups: [...state.groups, { ...group, id: `group_${Date.now()}` }]
      })),

      addGroupExpense: (expense) => set((state) => ({
        groupExpenses: [{ ...expense, id: `g_exp_${Date.now()}`, date: new Date().toISOString() }, ...state.groupExpenses]
      })),

      addSettlement: (settlement) => set((state) => ({
        settlements: [...state.settlements, { ...settlement, id: `set_${Date.now()}`, date: new Date().toISOString() }]
      })),

      removeGroupExpense: (id) => set((state) => ({
        groupExpenses: state.groupExpenses.filter(e => e.id !== id)
      })),

      removeGroup: (groupId) => set((state) => ({
        groups: state.groups.filter(g => g.id !== groupId),
        groupExpenses: state.groupExpenses.filter(e => e.groupId !== groupId),
        settlements: state.settlements.filter(s => s.groupId !== groupId)
      })),

      removeGroupMember: (groupId, memberId) => set((state) => ({
        groups: state.groups.map(g => 
          g.id === groupId 
            ? { ...g, members: g.members.filter(m => m.id !== memberId) }
            : g
        ),
        groupExpenses: state.groupExpenses.filter(e => !(e.groupId === groupId && e.paidBy === memberId))
      })),
    }),
    {
      name: 'trackent-groups',
    }
  )
);
