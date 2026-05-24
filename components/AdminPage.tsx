import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Trash2, Eye, EyeOff, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

export interface Account {
  id: string;
  name: string;
  passcode: string;
}

export const getAccounts = async (): Promise<Account[]> => {
  try {
    const { data, error } = await supabase.from('accounts').select('*');
    if (error) throw error;
    return data as Account[];
  } catch { return []; }
};

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscodes, setShowPasscodes] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    getAccounts().then(a => { setAccounts(a); setLoading(false); });
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!/^\d{6}$/.test(passcode)) { setError('Passcode must be exactly 6 digits'); return; }
    if (accounts.some(a => a.passcode === passcode)) { setError('Passcode already in use'); return; }
    const newAccount: Account = { id: crypto.randomUUID(), name: name.trim(), passcode };
    const { error: err } = await supabase.from('accounts').insert(newAccount);
    if (err) { setError('Failed to save: ' + err.message); return; }
    setAccounts(prev => [...prev, newAccount]);
    setName(''); setPasscode(''); setError('');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('accounts').delete().eq('id', id);
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
              <p className="text-sm text-slate-500">Manage branches</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /> Exit
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Add Branch</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Branch Name</label>
            <input
              type="text"
              placeholder="e.g. Main Branch"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Passcode</label>
            <input
              type="number"
              placeholder="6-digit passcode"
              value={passcode}
              onChange={e => { setPasscode(e.target.value.slice(0, 6)); setError(''); }}
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> Add Branch
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-slate-700">Branches ({accounts.length})</h2>
          </div>
          {loading ? (
            <div className="p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : accounts.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-sm">No branches yet. Add one above.</p>
          ) : (
            <div className="divide-y">
              {accounts.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-slate-800">{a.name}</p>
                    <p className="text-sm text-slate-400 font-mono">
                      {showPasscodes[a.id] ? a.passcode : '••••••'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPasscodes(p => ({ ...p, [a.id]: !p[a.id] }))}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      {showPasscodes[a.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
