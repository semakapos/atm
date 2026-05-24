import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { getRecords, getMachines, getBusiness } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { Machine, ReconcileRecord } from '../types';
import { calculateSlipTotal, calculateStatementTotal, calculateDifference, calculateOpeningBalance, calculateClosingBalance } from '../services/balanceCalculationService';
import * as XLSX from 'xlsx';

export const Export: React.FC = () => {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<ReconcileRecord[]>([]);
  const [allRecords, setAllRecords] = useState<ReconcileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getMachines(user.id).then((machinesData) => {
        setMachines(machinesData);
        setSelectedMachines(machinesData.map(m => m.id));
      });
      getBusiness(user.id).then(setBusiness);
      getRecords(user.id).then(setAllRecords);
    }
  }, [user]);

  useEffect(() => {
    if (!startDate || !endDate || allRecords.length === 0) {
      setRecords([]);
      return;
    }
    if (selectedMachines.length === 0) {
      setRecords([]);
      return;
    }
    setRecords(
      allRecords.filter(r =>
        selectedMachines.includes(r.machineid) && r.date >= startDate && r.date <= endDate
      ).sort((a, b) => a.date.localeCompare(b.date))
    );
  }, [selectedMachines, startDate, endDate, allRecords]);

  const handleMachineToggle = (machineId: string) => {
    setSelectedMachines(prev =>
      prev.includes(machineId)
        ? prev.filter(id => id !== machineId)
        : [...prev, machineId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMachines(machines.map(m => m.id));
  };

  const handleDeselectAll = () => {
    setSelectedMachines([]);
  };

  const handleExportToExcel = () => {
    if (selectedMachines.length === 0 || !startDate || !endDate || records.length === 0) return;

    setLoading(true);
    try {
      const workbook = XLSX.utils.book_new();

      // Create single sheet with business info at top
      const exportData: any[] = [];

      // Business Information Header
      exportData.push({ 'Date': business?.name || 'Business Name' });
      if (business?.address) exportData.push({ 'Date': business.address });
      if (business?.phone) exportData.push({ 'Date': `Tel: ${business.phone}` });
      if (business?.email) exportData.push({ 'Date': `Email: ${business.email}` });
      exportData.push({ 'Date': '' });
      exportData.push({ 'Date': `Period: ${new Date(startDate).toLocaleDateString('en-GB')} to ${new Date(endDate).toLocaleDateString('en-GB')}` });
      exportData.push({ 'Date': `Export Date: ${new Date().toLocaleDateString('en-GB')}` });
      exportData.push({ 'Date': '' });

      // Column Headers
      exportData.push({
        'Date': 'Date',
        'Machine': 'Machine',
        'Bank': 'Bank',
        'Opening Balance': 'Opening Balance',
        'Slip - Mada': 'Slip - Mada',
        'Slip - Visa': 'Slip - Visa',
        'Slip - Mastercard': 'Slip - Mastercard',
        'Slip - GCC': 'Slip - GCC',
        'Slip Total': 'Slip Total',
        'Statement - Mada': 'Statement - Mada',
        'Statement - Visa': 'Statement - Visa',
        'Statement - Mastercard': 'Statement - Mastercard',
        'Statement - GCC': 'Statement - GCC',
        'Statement Total': 'Statement Total',
        'Difference': 'Difference',
        'Closing Balance': 'Closing Balance',
        'Notes': 'Notes'
      });

      // Data Rows
      const dates = [...new Set(records.map(r => r.date))].sort();
      dates.forEach(date => {
        const dateRecords = records.filter(r => r.date === date);
        dateRecords.forEach(record => {
          const machine = machines.find(m => m.id === record.machineid);
          const opening = calculateOpeningBalance(record.machineid, record.date, allRecords);
          const slipTotal = calculateSlipTotal(record);
          const statementTotal = calculateStatementTotal(record);
          const diff = calculateDifference(record);
          const closing = calculateClosingBalance(record.machineid, record.date, allRecords);

          exportData.push({
            'Date': new Date(date).toLocaleDateString('en-GB'),
            'Machine': machine?.name || '',
            'Bank': machine?.bankname || '',
            'Opening Balance': opening.toFixed(2),
            'Slip - Mada': record.mada.toFixed(2),
            'Slip - Visa': record.visa.toFixed(2),
            'Slip - Mastercard': record.mastercard.toFixed(2),
            'Slip - GCC': record.gcc.toFixed(2),
            'Slip Total': slipTotal.toFixed(2),
            'Statement - Mada': (record.bankmada || 0).toFixed(2),
            'Statement - Visa': (record.bankvisa || 0).toFixed(2),
            'Statement - Mastercard': (record.bankmastercard || 0).toFixed(2),
            'Statement - GCC': (record.bankgcc || 0).toFixed(2),
            'Statement Total': statementTotal.toFixed(2),
            'Difference': diff.toFixed(2),
            'Closing Balance': closing.toFixed(2),
            'Notes': record.notes || ''
          });
        });
      });

      // Summary Row
      const totalSlip = records.reduce((sum, r) => sum + calculateSlipTotal(r), 0);
      const totalStatement = records.reduce((sum, r) => sum + calculateStatementTotal(r), 0);
      const netDiff = records.reduce((sum, r) => sum + calculateDifference(r), 0);

      exportData.push({
        'Date': '',
        'Machine': '',
        'Bank': '',
        'Opening Balance': '',
        'Slip - Mada': '',
        'Slip - Visa': '',
        'Slip - Mastercard': '',
        'Slip - GCC': '',
        'Slip Total': '',
        'Statement - Mada': '',
        'Statement - Visa': '',
        'Statement - Mastercard': '',
        'Statement - GCC': '',
        'Statement Total': '',
        'Difference': '',
        'Closing Balance': '',
        'Notes': ''
      });
      exportData.push({
        'Date': 'SUMMARY',
        'Machine': '',
        'Bank': '',
        'Opening Balance': '',
        'Slip - Mada': '',
        'Slip - Visa': '',
        'Slip - Mastercard': '',
        'Slip - GCC': '',
        'Slip Total': totalSlip.toFixed(2),
        'Statement - Mada': '',
        'Statement - Visa': '',
        'Statement - Mastercard': '',
        'Statement - GCC': '',
        'Statement Total': totalStatement.toFixed(2),
        'Difference': netDiff.toFixed(2),
        'Closing Balance': '',
        'Notes': ''
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData, { skipHeader: true });
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reconciliation');

      const filename = `${business?.name || 'Reconciliation'}_${startDate}_to_${endDate}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-600 p-2 rounded-lg">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Export Data</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700">
              Select Machines
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {machines.map(machine => (
              <label
                key={machine.id}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedMachines.includes(machine.id)}
                  onChange={() => handleMachineToggle(machine.id)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{machine.name}</div>
                  <div className="text-xs text-slate-500">{machine.bankname}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {records.length > 0 && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-800 mb-2">Preview</h3>
            <p className="text-sm text-slate-600">
              Found {records.length} records for {selectedMachines.length} machine(s) from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Total Slip: </span>
                <span className="font-bold text-blue-600">
                  {records.reduce((sum, r) => sum + calculateSlipTotal(r), 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Total Statement: </span>
                <span className="font-bold text-green-600">
                  {records.reduce((sum, r) => sum + calculateStatementTotal(r), 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Net Difference: </span>
                <span className={`font-bold ${records.reduce((sum, r) => sum + calculateDifference(r), 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {records.reduce((sum, r) => sum + calculateDifference(r), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleExportToExcel}
          disabled={selectedMachines.length === 0 || !startDate || !endDate || loading || records.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-5 h-5" />
          {loading ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>
    </div>
  );
};
