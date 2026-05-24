import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { getRecords, getMachines } from '../services/storageService';
import { analyzeFinancials } from '../services/geminiService';
import { ReconcileRecord, Machine } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Loader2, Download } from 'lucide-react';
import { exportToXLSX } from '../services/exportService';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<ReconcileRecord[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [recordsData, machinesData] = await Promise.all([
                getRecords(user.id),
                getMachines(user.id)
            ]);
            setRecords(recordsData);
            setMachines(machinesData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [user]);

  // Chart and total calculations remain the same, they operate on the fetched state
  const chartData = useMemo(() => {
    const dataByDate: Record<string, { date: string; totalMachine: number; totalBank: number; difference: number }> = {};
    records.forEach(r => {
      if (!dataByDate[r.date]) {
        dataByDate[r.date] = { date: r.date, totalMachine: 0, totalBank: 0, difference: 0 };
      }
      dataByDate[r.date].totalMachine += Number(r.machineTotal);
      dataByDate[r.date].totalBank += Number(r.bankCredit);
      dataByDate[r.date].difference += Number(r.difference);
    });
    return Object.values(dataByDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  }, [records]);

  const totals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === today);
    
    let totalOpening = 0;
    let totalClosing = 0;
    
    // Calculate for each machine
    machines.forEach(machine => {
      // Always get opening balance from previous day's closing balance
      const sortedPrevRecords = records
        .filter(r => r.machineId === machine.id && r.date < today)
        .sort((a, b) => b.date.localeCompare(a.date));
      
      const lastRecord = sortedPrevRecords[0];
      const openingBalance = lastRecord ? Number(lastRecord.closingBalance || 0) : 0;
      totalOpening += openingBalance;
      
      // Get today's closing balance if record exists
      const todayRecord = todayRecords.find(r => r.machineId === machine.id);
      if (todayRecord) {
        totalClosing += Number(todayRecord.closingBalance || 0);
      } else {
        totalClosing += openingBalance; // Same as opening since no transactions
      }
    });
    
    return {
      sales: todayRecords.reduce((acc, r) => acc + Number(r.machineTotal || 0), 0),
      bank: todayRecords.reduce((acc, r) => acc + Number(r.bankCredit || 0), 0),
      diff: totalClosing - totalOpening,
      opening: totalOpening,
      closing: totalClosing
    };
  }, [records, machines]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
        const result = await analyzeFinancials(records, machines);
        setAiAnalysis(result);
    } catch(error) {
        console.error("AI Analysis failed:", error);
        setAiAnalysis("Sorry, the AI analysis could not be completed at this time.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="ml-2 text-slate-500">Loading Dashboard...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Opening Balance</p>
              <p className="text-2xl font-bold text-blue-900">₹{totals.opening.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Machine Sales</p>
              <p className="text-2xl font-bold text-green-900">₹{totals.sales.toFixed(2)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Bank Credit</p>
              <p className="text-2xl font-bold text-purple-900">₹{totals.bank.toFixed(2)}</p>
            </div>
            <Download className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Net Difference</p>
              <p className={`text-2xl font-bold ${totals.diff >= 0 ? 'text-green-900' : 'text-red-900'}`}>₹{totals.diff.toFixed(2)}</p>
            </div>
            {totals.diff >= 0 ? <CheckCircle className="w-8 h-8 text-green-600" /> : <AlertTriangle className="w-8 h-8 text-red-600" />}
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Closing Balance</p>
              <p className="text-2xl font-bold text-slate-900">₹{totals.closing.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-slate-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Sales vs. Settlement (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={{fontSize: 12}} /><YAxis tick={{fontSize: 12}} /><Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} /><Legend /><Bar dataKey="totalMachine" name="Machine Reported" fill="#3b82f6" radius={[4, 4, 0, 0]} /><Bar dataKey="totalBank" name="Bank Credit" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Net Balance Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={{fontSize: 12}} /><YAxis tick={{fontSize: 12}} /><Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} /><Legend /><Line type="monotone" dataKey="difference" name="Net Balance" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} /></LineChart></ResponsiveContainer>
          </div>
        </div>
      </div>



      <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl shadow-sm border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-600" /><h3 className="text-lg font-semibold text-indigo-900">AI Financial Insight</h3></div>
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Discrepancies'}
          </button>
        </div>
        {aiAnalysis ? (
          <div className="prose prose-indigo max-w-none text-slate-700 bg-white p-4 rounded-lg border border-indigo-50 shadow-sm" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br />') }}></div>
        ) : (
          <p className="text-slate-500 text-sm">Click analyze to get Gemini AI's take on your machine reconciliation variances.</p>
        )}
      </div>
    </div>
  );
};
