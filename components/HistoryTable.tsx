import React, { useState, useEffect, useMemo } from 'react';
import { getRecords, getMachines } from '../services/storageService';
import { ReconcileRecord, Machine } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Filter, Calendar, Layers, Loader2, Download } from 'lucide-react';
import { exportToXLSX } from '../services/exportService';

export const HistoryTable: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<ReconcileRecord[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filterDate, setFilterDate] = useState('');
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
            console.error("Error fetching summary data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [user]);

  const machineMap = useMemo(() => {
    return machines.reduce((acc, m) => ({ ...acc, [m.id]: m.name }), {} as Record<string, string>);
  }, [machines]);

  const dailyGroups = useMemo(() => {
    let filtered = [...records];
    if (filterDate) {
        filtered = filtered.filter(r => r.date === filterDate);
    }
    const dateGroups: Record<string, ReconcileRecord[]> = {};
    filtered.forEach(r => {
        if (!dateGroups[r.date]) dateGroups[r.date] = [];
        dateGroups[r.date].push(r);
    });
    return Object.entries(dateGroups)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .map(([date, dayRecords]) => {
            const machineGroups: Record<string, ReconcileRecord[]> = {};
            dayRecords.forEach(r => {
                if (!machineGroups[r.machineId]) machineGroups[r.machineId] = [];
                machineGroups[r.machineId].push(r);
            });
            const aggregatedRows = Object.values(machineGroups).map(mRecords => {
                const sorted = mRecords.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                const first = sorted[0];
                const last = sorted[sorted.length - 1];
                return {
                    id: first.id, machineId: first.machineId, openingBalance: first.openingBalance, closingBalance: last.closingBalance,
                    mada: mRecords.reduce((s, r) => s + (r.mada || 0), 0),
                    visa: mRecords.reduce((s, r) => s + (r.visa || 0), 0),
                    mastercard: mRecords.reduce((s, r) => s + (r.mastercard || 0), 0),
                    gcc: mRecords.reduce((s, r) => s + (r.gcc || 0), 0),
                    machineTotal: mRecords.reduce((s, r) => s + (r.machineTotal || 0), 0),
                    bankMada: mRecords.reduce((s, r) => s + (r.bankMada || 0), 0),
                    bankVisa: mRecords.reduce((s, r) => s + (r.bankVisa || 0), 0),
                    bankMastercard: mRecords.reduce((s, r) => s + (r.bankMastercard || 0), 0),
                    bankGcc: mRecords.reduce((s, r) => s + (r.bankGcc || 0), 0),
                    bankCredit: mRecords.reduce((s, r) => s + (r.bankCredit || 0), 0),
                    difference: mRecords.reduce((s, r) => s + (r.difference || 0), 0),
                    entryCount: mRecords.length
                };
            });
            const totalSales = aggregatedRows.reduce((sum, r) => sum + r.machineTotal, 0);
            const totalBank = aggregatedRows.reduce((sum, r) => sum + r.bankCredit, 0);
            const totalDiff = aggregatedRows.reduce((sum, r) => sum + r.difference, 0);
            const totalOpening = aggregatedRows.reduce((sum, r) => sum + (r.openingBalance || 0), 0);
            const totalClosing = aggregatedRows.reduce((sum, r) => sum + (r.closingBalance || 0), 0);
            return { date, rows: aggregatedRows, totalSales, totalBank, totalDiff, totalOpening, totalClosing };
        });
  }, [records, filterDate]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="ml-2 text-slate-500">Loading Summaries...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">




      {dailyGroups.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" /><h3 className="text-lg font-medium text-slate-700">No records found</h3><p className="text-slate-500">Start by adding daily entries.</p>
        </div>
      ) : (
        <div className="space-y-8">
            {dailyGroups.map((group) => (
                <div key={group.date} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="flex items-center gap-3 min-w-fit"><div className="bg-blue-100 p-2.5 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div><div><span className="text-lg font-bold text-slate-800 block">{group.date}</span><span className="text-xs text-slate-500">{group.rows.length} Machines Active</span></div></div>
                        <div className="flex flex-wrap gap-y-4 gap-x-8 text-sm w-full justify-end">
                            <div className="flex gap-8 pr-8 border-r border-slate-200 hidden md:flex">
                                <div className="text-right"><span className="block text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Total Opening</span><span className="font-bold text-slate-600 text-base">${group.totalOpening.toFixed(2)}</span></div>
                                <div className="text-right"><span className="block text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Total Closing</span><span className="font-bold text-slate-600 text-base">${group.totalClosing.toFixed(2)}</span></div>
                            </div>
                            <div className="flex gap-6 md:gap-8 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right"><span className="block text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Total Sales</span><span className="font-bold text-slate-800 text-base">${group.totalSales.toFixed(2)}</span></div>
                                <div className="text-right"><span className="block text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Total Bank</span><span className="font-bold text-emerald-600 text-base">${group.totalBank.toFixed(2)}</span></div>
                                <div className="text-right"><span className="block text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Net Balance</span><span className={`font-bold text-base ${ group.totalDiff < -0.01 ? 'text-red-600' : group.totalDiff > 0.01 ? 'text-emerald-600' : 'text-slate-400' }`}>{group.totalDiff > 0 ? '+' : ''}{group.totalDiff.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs md:text-sm text-slate-600 whitespace-nowrap">
                            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                                <tr className="uppercase text-[10px] tracking-wider"><th className="px-4 py-1 border-r border-slate-100"></th><th colSpan={2} className="px-4 py-1 text-center border-r border-slate-100 bg-slate-100/50 text-slate-400">Balance</th><th colSpan={5} className="px-4 py-1 text-center border-r border-slate-100 bg-blue-50/30 text-blue-500">Machine Report</th><th colSpan={5} className="px-4 py-1 text-center border-r border-slate-100 bg-emerald-50/30 text-emerald-500">Bank Credit</th><th className="px-4 py-1"></th></tr>
                                <tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase tracking-wider"><th className="px-4 py-2 border-r border-slate-100 font-semibold">Machine</th><th className="px-2 py-2 text-right bg-slate-100/50">Open</th><th className="px-2 py-2 text-right border-r border-slate-100 bg-slate-100/50">Close</th><th className="px-2 py-2 text-right bg-blue-50/30">Mada</th><th className="px-2 py-2 text-right bg-blue-50/30">Visa</th><th className="px-2 py-2 text-right bg-blue-50/30">MC</th><th className="px-2 py-2 text-right bg-blue-50/30">GCC</th><th className="px-2 py-2 text-right font-bold text-slate-600 border-r border-slate-100 bg-blue-50/30">Total</th><th className="px-2 py-2 text-right bg-emerald-50/30">Mada</th><th className="px-2 py-2 text-right bg-emerald-50/30">Visa</th><th className="px-2 py-2 text-right bg-emerald-50/30">MC</th><th className="px-2 py-2 text-right bg-emerald-50/30">GCC</th><th className="px-2 py-2 text-right font-bold text-emerald-600 border-r border-slate-100 bg-emerald-50/30">Total</th><th className="px-4 py-2 text-right font-semibold">Net</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {group.rows.map(row => (
                                    <tr key={row.machineId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800 border-r border-slate-100 flex items-center gap-2">{machineMap[row.machineId] || 'Unknown'}{row.entryCount > 1 && (<span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500" title={`${row.entryCount} entries aggregated`}><Layers className="w-3 h-3" /> {row.entryCount}</span>)}</td>
                                        <td className="px-2 py-3 text-right text-slate-500 bg-slate-50/30 font-mono">{row.openingBalance?.toFixed(2)}</td><td className="px-2 py-3 text-right text-slate-500 border-r border-slate-100 bg-slate-50/30 font-mono">{row.closingBalance?.toFixed(2)}</td>
                                        <td className="px-2 py-3 text-right text-slate-500 bg-blue-50/10">{row.mada}</td><td className="px-2 py-3 text-right text-slate-500 bg-blue-50/10">{row.visa}</td><td className="px-2 py-3 text-right text-slate-500 bg-blue-50/10">{row.mastercard}</td><td className="px-2 py-3 text-right text-slate-500 bg-blue-50/10">{row.gcc}</td><td className="px-2 py-3 text-right font-bold text-slate-800 border-r border-slate-100 bg-blue-50/20">${row.machineTotal.toFixed(2)}</td>
                                        <td className="px-2 py-3 text-right text-slate-500 bg-emerald-50/10">{row.bankMada || 0}</td><td className="px-2 py-3 text-right text-slate-500 bg-emerald-50/10">{row.bankVisa || 0}</td><td className="px-2 py-3 text-right text-slate-500 bg-emerald-50/10">{row.bankMastercard || 0}</td><td className="px-2 py-3 text-right text-slate-500 bg-emerald-50/10">{row.bankGcc || 0}</td><td className="px-2 py-3 text-right font-bold text-emerald-700 border-r border-slate-100 bg-emerald-50/20">${row.bankCredit.toFixed(2)}</td>
                                        <td className={`px-4 py-3 text-right font-mono font-medium ${ row.difference < -0.01 ? 'text-red-500' : row.difference > 0.01 ? 'text-emerald-500' : 'text-slate-300' }`}>{row.difference > 0 ? '+' : ''}{row.difference.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
