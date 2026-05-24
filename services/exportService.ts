import { utils, writeFile } from 'xlsx';
import { ReconcileRecord, Machine } from '../types';

export const exportToXLSX = (records: ReconcileRecord[], machines: Machine[], filename?: string) => {
  const machineMap = new Map(machines.map(m => [m.id, m]));

  // Detailed records sheet
  const detailData = records.map(record => {
    const machine = machineMap.get(record.machineId);
    return {
      'Date': record.date,
      'Machine': machine?.name || 'Unknown',
      'Bank': machine?.bankName || 'Unknown',
      'Opening Balance': record.openingBalance,
      'Closing Balance': record.closingBalance,
      'MADA (Machine)': record.mada,
      'VISA (Machine)': record.visa,
      'Mastercard (Machine)': record.mastercard,
      'GCC (Machine)': record.gcc,
      'Machine Total': record.machineTotal,
      'MADA (Bank)': record.bankMada || 0,
      'VISA (Bank)': record.bankVisa || 0,
      'Mastercard (Bank)': record.bankMastercard || 0,
      'GCC (Bank)': record.bankGcc || 0,
      'Bank Credit': record.bankCredit,
      'Difference': record.difference,
      'Notes': record.notes || ''
    };
  });

  // Machine summary sheet
  const summaryData = machines.map(machine => {
    const machineRecords = records.filter(r => r.machineId === machine.id);
    const totalMachine = machineRecords.reduce((sum, r) => sum + (r.machineTotal || 0), 0);
    const totalBank = machineRecords.reduce((sum, r) => sum + (r.bankCredit || 0), 0);
    const totalDiff = machineRecords.reduce((sum, r) => sum + (r.difference || 0), 0);
    const totalMada = machineRecords.reduce((sum, r) => sum + (r.mada || 0), 0);
    const totalVisa = machineRecords.reduce((sum, r) => sum + (r.visa || 0), 0);
    const totalMC = machineRecords.reduce((sum, r) => sum + (r.mastercard || 0), 0);
    const totalGCC = machineRecords.reduce((sum, r) => sum + (r.gcc || 0), 0);
    const totalBankMada = machineRecords.reduce((sum, r) => sum + (r.bankMada || 0), 0);
    const totalBankVisa = machineRecords.reduce((sum, r) => sum + (r.bankVisa || 0), 0);
    const totalBankMC = machineRecords.reduce((sum, r) => sum + (r.bankMastercard || 0), 0);
    const totalBankGCC = machineRecords.reduce((sum, r) => sum + (r.bankGcc || 0), 0);
    
    return {
      'Machine Name': machine.name,
      'Bank Name': machine.bankName,
      'Total Records': machineRecords.length,
      'Total Machine Sales': totalMachine,
      'Total Bank Credits': totalBank,
      'Net Difference': totalDiff,
      'MADA (Machine)': totalMada,
      'VISA (Machine)': totalVisa,
      'Mastercard (Machine)': totalMC,
      'GCC (Machine)': totalGCC,
      'MADA (Bank)': totalBankMada,
      'VISA (Bank)': totalBankVisa,
      'Mastercard (Bank)': totalBankMC,
      'GCC (Bank)': totalBankGCC,
      'Status': machine.active ? 'Active' : 'Inactive'
    };
  });

  const wb = utils.book_new();
  
  // Add summary sheet first
  const summaryWs = utils.json_to_sheet(summaryData);
  utils.book_append_sheet(wb, summaryWs, 'Machines Summary');
  
  // Add detailed records sheet
  const detailWs = utils.json_to_sheet(detailData);
  utils.book_append_sheet(wb, detailWs, 'Detailed Records');

  const defaultFilename = `reconcile-export-${new Date().toISOString().split('T')[0]}.xlsx`;
  writeFile(wb, filename || defaultFilename);
};