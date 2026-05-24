import { ReconcileRecord } from '../types';
import { safeAdd, safeSub, parseAmount } from './calculationService';

const cache = new Map<string, number>();

export const clearBalanceCache = () => {
  cache.clear();
};

export const calculateSlipTotal = (record: ReconcileRecord): number => {
  const baseTotal = safeAdd(
    parseAmount(record.mada),
    parseAmount(record.visa),
    parseAmount(record.mastercard),
    parseAmount(record.gcc)
  );

  const extraTotal = record.extrafields
    ? Object.values(record.extrafields).reduce((sum: number, f: any) =>
      safeAdd(sum, parseAmount(f?.slip || 0)), 0)
    : 0;

  return safeAdd(baseTotal, extraTotal);
};

export const calculateStatementTotal = (record: ReconcileRecord): number => {
  const baseTotal = safeAdd(
    parseAmount(record.bankmada),
    parseAmount(record.bankvisa),
    parseAmount(record.bankmastercard),
    parseAmount(record.bankgcc)
  );

  const extraTotal = record.extrafields
    ? Object.values(record.extrafields).reduce((sum: number, f: any) =>
      safeAdd(sum, parseAmount(f?.statement || 0)), 0)
    : 0;

  return safeAdd(baseTotal, extraTotal);
};

export const calculateDifference = (record: ReconcileRecord): number => {
  return safeSub(calculateStatementTotal(record), calculateSlipTotal(record));
};

/**
 * Calculate opening balance for a machine on a specific date.
 * Opening balance = Closing balance from the previous day with a record.
 * This is calculated as the cumulative sum of all differences up to that point.
 */
export const calculateOpeningBalance = (
  machineId: string,
  date: string,
  allRecords: ReconcileRecord[]
): number => {
  // Get all records for this machine before this date, sorted chronologically
  const prevRecords = allRecords
    .filter(r => r.machineid === machineId && r.date < date)
    .sort((a, b) => a.date.localeCompare(b.date)); // Ascending order

  if (prevRecords.length === 0) {
    return 0;
  }

  // Calculate cumulative balance through all previous records
  let cumulativeBalance = 0;
  for (const record of prevRecords) {
    const diff = calculateDifference(record);
    cumulativeBalance = safeAdd(cumulativeBalance, diff);
  }

  return cumulativeBalance;
};

/**
 * Calculate closing balance for a machine on a specific date.
 * Closing balance = Opening balance + Today's difference
 */
export const calculateClosingBalance = (
  machineId: string,
  date: string,
  allRecords: ReconcileRecord[]
): number => {
  const cacheKey = `${machineId}-${date}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const record = allRecords.find(r => r.machineid === machineId && r.date === date);

  if (!record) {
    // No record for today - closing balance is same as opening
    const opening = calculateOpeningBalance(machineId, date, allRecords);
    cache.set(cacheKey, opening);
    return opening;
  }

  // Calculate: Opening + Today's Difference
  const opening = calculateOpeningBalance(machineId, date, allRecords);
  const difference = calculateDifference(record);
  const closing = safeAdd(opening, difference);

  cache.set(cacheKey, closing);
  return closing;
};

