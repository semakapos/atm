import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { supabase } from '../services/supabase';

const ADMIN_PASSCODE = '393939';

export const Auth: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      sessionStorage.setItem('admin', '1');
      navigate('/admin');
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.from('accounts').select('*').eq('passcode', passcode).maybeSingle();
      if (data) {
        sessionStorage.setItem('auth', data.id);
        window.dispatchEvent(new Event('authChanged'));
        navigate('/');
      } else {
        setError('Incorrect passcode');
        setPasscode('');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <div className="inline-flex items-center justify-center bg-blue-600 p-3 rounded-xl">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">ReconcilePro</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={passcode}
            onChange={e => { setPasscode(e.target.value); setError(''); }}
            placeholder="Enter passcode"
            autoFocus
            className={`w-full p-3 text-center text-xl tracking-widest border rounded-lg outline-none focus:ring-2 ${
              error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
