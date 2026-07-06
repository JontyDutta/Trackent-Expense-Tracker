import React, { useState } from 'react';
import { useGroupStore } from '../store/useGroupStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Users, Plus, Receipt, Trash2, Wallet, ChevronLeft } from 'lucide-react';

export default function Groups() {
  const { groups, addGroup, groupExpenses, addGroupExpense, removeGroupExpense, removeGroup, removeGroupMember } = useGroupStore();
  const { currency } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('list'); // 'list', 'new_group', 'group_detail'
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // New Group State
  const [newGroupName, setNewGroupName] = useState('');
  const [newMembers, setNewMembers] = useState([{ name: 'Me (You)' }]);

  // New Expense State
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('');

  const currentGroup = groups.find(g => g.id === selectedGroupId);
  const expensesForGroup = groupExpenses.filter(e => e.groupId === selectedGroupId);

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || newMembers.length < 2) return;
    
    const membersWithIds = newMembers.map((m, i) => ({
      id: i === 0 ? 'user_me' : `member_${Date.now()}_${i}`,
      name: m.name
    }));

    addGroup({
      name: newGroupName,
      members: membersWithIds
    });

    setNewGroupName('');
    setNewMembers([{ name: 'Me (You)' }]);
    setActiveTab('list');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expTitle || !expAmount || !expPaidBy) return;

    // Equal split math
    const splitAmount = parseFloat(expAmount) / currentGroup.members.length;
    const splitDetails = {};
    currentGroup.members.forEach(m => {
      splitDetails[m.id] = splitAmount;
    });

    addGroupExpense({
      groupId: selectedGroupId,
      title: expTitle,
      amount: parseFloat(expAmount),
      paidBy: expPaidBy,
      splitMethod: 'equal',
      splitDetails
    });

    setIsAddingExpense(false);
    setExpTitle('');
    setExpAmount('');
  };

  const individualSpending = React.useMemo(() => {
    if (!currentGroup) return [];
    return currentGroup.members.map(member => {
      const totalPaid = expensesForGroup
        .filter(exp => exp.paidBy === member.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return { ...member, totalPaid };
    }).sort((a,b) => b.totalPaid - a.totalPaid);
  }, [currentGroup, expensesForGroup]);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      
      {activeTab === 'list' && (
        <>
          <div className="flex justify-between items-end mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Groups</h1>
            <button 
              onClick={() => setActiveTab('new_group')}
              className="text-foreground text-sm font-medium hover:underline underline-offset-2 flex items-center gap-1"
            >
              <Plus strokeWidth={1.5} size={16} /> New Group
            </button>
          </div>
          
          {groups.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
               <p className="text-gray-400 mb-4 text-sm">No groups yet.</p>
               <button onClick={() => setActiveTab('new_group')} className="text-sm text-foreground font-medium underline underline-offset-4 hover:text-gray-500 transition-colors">Create your first group</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {groups.map(g => (
                <div 
                  key={g.id} 
                  onClick={() => { setSelectedGroupId(g.id); setActiveTab('group_detail'); }}
                  className="bg-card p-6 rounded-2xl border border-border shadow-sm text-left hover:border-foreground/30 transition-colors relative group cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg mb-1">{g.name}</h3>
                      <p className="text-gray-500 text-xs">{g.members.length} members</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete the group "${g.name}" and all its expenses?`)) {
                          removeGroup(g.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 transition-all"
                      title="Delete Group"
                    >
                      <Trash2 strokeWidth={1.5} size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'new_group' && (
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">New Group</h2>
          <form onSubmit={handleCreateGroup} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Group Name</label>
              <input 
                type="text" required
                value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full bg-transparent border-b border-border py-2 text-foreground focus:outline-none focus:border-foreground transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                placeholder="e.g. Trip to Paris"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Members</label>
              {newMembers.map((m, idx) => (
                <div key={idx} className="flex gap-2 mb-3 items-center">
                  <input 
                    type="text" required readOnly={idx === 0}
                    value={m.name} 
                    onChange={(e) => {
                      const updated = [...newMembers];
                      updated[idx].name = e.target.value;
                      setNewMembers(updated);
                    }}
                    className={`flex-1 bg-transparent border-b py-2 text-sm focus:outline-none transition-colors ${idx === 0 ? 'text-gray-400 border-dashed border-border/50' : 'text-foreground border-border focus:border-foreground'}`}
                    placeholder="Member Name"
                  />
                  {idx > 0 && (
                    <button type="button" onClick={() => setNewMembers(newMembers.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 px-2 transition-colors">
                      <Trash2 strokeWidth={1.5} size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" onClick={() => setNewMembers([...newMembers, { name: '' }])}
                className="text-foreground text-xs font-medium hover:underline underline-offset-2 mt-2 inline-block"
              >
                + Add Member
              </button>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setActiveTab('list')} className="flex-1 bg-secondary text-foreground py-3 rounded-xl font-bold">Cancel</button>
              <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">Create</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'group_detail' && currentGroup && (
        <>
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setActiveTab('list')} className="text-gray-400 hover:text-foreground transition-colors">
              <ChevronLeft strokeWidth={1.5} size={24} />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">{currentGroup.name}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-medium text-lg flex items-center gap-2"><Receipt strokeWidth={1.5} size={18} className="text-gray-400"/> Expenses</h3>
                  <button onClick={() => setIsAddingExpense(!isAddingExpense)} className="text-foreground font-medium text-xs hover:underline underline-offset-2">+ Add</button>
                </div>
                
                {isAddingExpense ? (
                  <form onSubmit={handleAddExpense} className="mb-6 p-4 bg-secondary/30 rounded-xl border border-border space-y-4">
                    <input 
                      type="text" required placeholder="What was it for?"
                      value={expTitle} onChange={(e) => setExpTitle(e.target.value)}
                      className="w-full bg-transparent border-b border-border py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                    />
                    <div className="flex gap-2 items-center border-b border-border focus-within:border-foreground transition-colors">
                       <span className="text-gray-500 pl-1">{currency.symbol}</span>
                       <input 
                        type="number" step="0.01" required placeholder="0.00"
                        value={expAmount} onChange={(e) => setExpAmount(e.target.value)}
                        className="flex-1 bg-transparent py-2 px-2 text-sm focus:outline-none"
                       />
                    </div>
                    <div>
                      <select required value={expPaidBy} onChange={(e) => setExpPaidBy(e.target.value)} className="w-full bg-transparent border-b border-border py-2 text-sm text-foreground focus:outline-none">
                        <option value="" disabled className="bg-background text-foreground">Who paid?</option>
                        {currentGroup.members.map(m => <option key={m.id} value={m.id} className="bg-background text-foreground">{m.name}</option>)}
                      </select>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2 mb-4">Defaults to equal split</p>
                    <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-sm">Save Expense</button>
                  </form>
                ) : null}

                <div className="flex flex-col">
                  {expensesForGroup.length === 0 ? <p className="text-sm text-gray-400">No expenses added yet.</p> : null}
                  {expensesForGroup.map(exp => (
                    <div key={exp.id} className="group relative flex justify-between items-center py-3 border-b border-border/50 hover:bg-secondary/20 transition-all">
                       <div className="px-1">
                         <p className="font-medium text-foreground">{exp.title}</p>
                         <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Paid by {currentGroup.members.find(m => m.id === exp.paidBy)?.name}</p>
                       </div>
                       <div className="flex items-center gap-3 px-1">
                         <span className="font-medium text-foreground">{currency.symbol}{exp.amount.toFixed(2)}</span>
                         <button 
                          onClick={() => { if(window.confirm('Delete this expense?')) removeGroupExpense(exp.id); }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                         >
                           <Trash2 strokeWidth={1.5} size={16} />
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
               <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                 <h3 className="font-medium text-lg mb-6 flex items-center gap-2 text-foreground">
                   <Wallet strokeWidth={1.5} size={18} className="text-gray-400"/> Summary
                 </h3>
                 <div className="space-y-4">
                   {individualSpending.map((member) => (
                     <div key={member.id} className="flex items-center justify-between py-3 border-b border-border/50 group">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">{member.name}</p>
                          <p className="text-2xl font-light text-foreground">
                            {currency.symbol}{member.totalPaid.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-center h-full">
                          <div className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                            Total Paid
                          </div>
                          {member.id !== 'user_me' && (
                            <button 
                              onClick={() => {
                                if (window.confirm(`Remove ${member.name} from this group? (Any expenses they paid will be deleted)`)) {
                                  removeGroupMember(selectedGroupId, member.id);
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                     </div>
                   ))}
                   {individualSpending.length === 0 && (
                     <p className="text-sm text-gray-400">Add expenses to see the summary.</p>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
