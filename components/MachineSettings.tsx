import React, { useState, useEffect } from 'react';
import { getMachines, saveMachine, deleteMachine, generateId, initializeStorage, getRecords } from '../services/storageService';
import { Machine } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Plus, Server, Loader2, Edit2, Check, X } from 'lucide-react';

export const MachineSettings: React.FC = () => {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMachine, setNewMachine] = useState({ name: '', bankName: '' });
  const [editMachine, setEditMachine] = useState({ name: '', bankName: '' });
  const [deleteModal, setDeleteModal] = useState<{show: boolean, machineId: string, machineName: string, hasTransactions: boolean}>({show: false, machineId: '', machineName: '', hasTransactions: false});

  const fetchMachines = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        // This will initialize if needed
        await initializeStorage(user.id);
        setMachines(await getMachines(user.id));
    } catch (error) {
        console.error("Error fetching machines:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, [user]);

  const handleAdd = async () => {
    if (!newMachine.name || !user) return;
    
    const machine: Machine = {
      id: generateId(),
      userid: user.id,
      name: newMachine.name,
      bankname: newMachine.bankName,
      active: true
    };
    
    try {
        console.log('Attempting to save machine:', machine);
        await saveMachine(machine);
        await fetchMachines();
        setNewMachine({ name: '', bankName: '' });
        setIsAdding(false);
    } catch (error: any) {
        console.error("Error adding machine:", error);
        console.error("Error details:", error.message, error.code, error.details);
        alert(`Failed to add the machine: ${error.message || 'Please try again.'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const machine = machines.find(m => m.id === id);
      // Check local machines list for any record referencing this machine
      // to avoid a full DB fetch just for this check
      const { supabase } = await import('../services/supabase');
      const { data } = await supabase
        .from('records')
        .select('id')
        .eq('machineid', id)
        .limit(1);
      const hasTransactions = (data?.length ?? 0) > 0;
      setDeleteModal({
        show: true,
        machineId: id,
        machineName: machine?.name || 'Unknown Machine',
        hasTransactions
      });
    } catch (error) {
      console.error("Error checking machine transactions:", error);
      alert("Failed to check machine status. Please try again.");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteMachine(deleteModal.machineId);
      await fetchMachines();
      setDeleteModal({show: false, machineId: '', machineName: '', hasTransactions: false});
    } catch (error) {
      console.error("Error deleting machine:", error);
      alert("Failed to delete the machine. Please try again.");
    }
  };

  const handleEdit = (machine: Machine) => {
    setEditingId(machine.id);
    setEditMachine({ name: machine.name, bankName: machine.bankname });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editMachine.name || !user) return;
    
    const machine = machines.find(m => m.id === id);
    if (!machine) return;
    
    const updatedMachine: Machine = {
      ...machine,
      name: editMachine.name,
      bankname: editMachine.bankName
    };
    
    try {
      await saveMachine(updatedMachine);
      await fetchMachines();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating machine:", error);
      alert("Failed to update the machine. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditMachine({ name: '', bankName: '' });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
             <h2 className="text-2xl font-bold text-slate-800">Machines</h2>
             <p className="text-slate-500">Manage your card terminals.</p>
        </div>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
            <Plus className="w-4 h-4" /> Add Machine
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-6 animate-in slide-in-from-top-4">
            <h3 className="font-semibold text-slate-800 mb-4">New Terminal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-slate-600 mb-1">Machine Name / ID</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., POS Front Desk" value={newMachine.name} onChange={e => setNewMachine({...newMachine, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm text-slate-600 mb-1">Settlement Bank</label>
                     <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Chase" value={newMachine.bankName} onChange={e => setNewMachine({...newMachine, bankName: e.target.value})} />
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
                <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Machine</button>
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
             <div className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 mx-auto animate-spin" /></div>
        ) : machines.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
                <Server className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No machines configured yet. Add your first one!</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {machines.map(m => (
                    <div key={m.id} className="p-4 group hover:bg-slate-50">
                        {editingId === m.id ? (
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 p-3 rounded-full text-slate-500"><Server className="w-5 h-5" /></div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={editMachine.name}
                                        onChange={(e) => setEditMachine({...editMachine, name: e.target.value})}
                                        className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Machine name"
                                    />
                                    <input
                                        type="text"
                                        value={editMachine.bankName}
                                        onChange={(e) => setEditMachine({...editMachine, bankName: e.target.value})}
                                        className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Bank name"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSaveEdit(m.id)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                        title="Save"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                                        title="Cancel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-100 p-3 rounded-full text-slate-500"><Server className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{m.name}</h4>
                                        <p className="text-sm text-slate-500">{m.bankname}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(m)}
                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(m.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
      
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {deleteModal.hasTransactions ? 'Cannot Delete Machine' : 'Delete Machine'}
            </h3>
            {deleteModal.hasTransactions ? (
              <div>
                <p className="text-slate-600 mb-6">
                  Cannot delete <strong>{deleteModal.machineName}</strong> because it has transaction history. 
                  You can only delete machines that have never been used.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setDeleteModal({show: false, machineId: '', machineName: '', hasTransactions: false})}
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete <strong>{deleteModal.machineName}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteModal({show: false, machineId: '', machineName: '', hasTransactions: false})}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
