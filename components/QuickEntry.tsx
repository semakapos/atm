import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getMachines, saveRecord, generateId, getRecords } from '../services/storageService';
import { safeAdd, safeSub, parseAmount } from '../services/calculationService';
import { calculateSlipTotal, calculateStatementTotal, calculateDifference, calculateOpeningBalance, calculateClosingBalance, clearBalanceCache } from '../services/balanceCalculationService';
import { Machine, ReconcileRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Save, ChevronLeft, ChevronRight, Plus, Trash2, Calendar, Download, Printer, Search } from 'lucide-react';

interface FormAmounts {
  openingBalance: string;
  mada: string;
  visa: string;
  mastercard: string;
  gcc: string;
  bankMada: string;
  bankVisa: string;
  bankMastercard: string;
  bankGcc: string;
}

const CARD_TYPES = ['mada', 'visa', 'mastercard', 'gcc'] as const;

const Row = React.memo(({ label, value }: { label: string, value: number }) => (
  <div className="flex justify-between items-center text-sm mb-1">
    <span>{label}</span>
    <span className="font-medium">{value.toFixed(2)}</span>
  </div>
));

const MachineCard: React.FC<{
  machine: Machine;
  record?: ReconcileRecord;
  records: ReconcileRecord[];
  date: string;
  onClick: () => void;
}> = ({ machine, record, records, date, onClick }) => {

  if (!record) {
    const openingBalance = calculateOpeningBalance(machine.id, date, records);

    return (
      <div className="bg-white border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow" onClick={onClick}>
        <h3 className="font-bold text-lg text-blue-600 mb-3">{machine.name}</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-blue-600 font-medium mb-2 border-b border-blue-200 pb-1">Slip</div>
              <Row label="Mada" value={0} />
              <Row label="Visa" value={0} />
              <Row label="MC" value={0} />
              <Row label="GCC" value={0} />
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">0.00</span>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 p-2 rounded">
              <div className="text-emerald-600 font-medium mb-2 border-b border-emerald-200 pb-1">Statement</div>
              <Row label="Mada" value={0} />
              <Row label="Visa" value={0} />
              <Row label="MC" value={0} />
              <Row label="GCC" value={0} />
              <div className="border-t border-emerald-200 pt-2 mt-2">
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span className="text-emerald-600">0.00</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-slate-500">Opening: </span>
                <span className={`font-bold ${openingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {openingBalance.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Diff: </span>
                <span className="font-bold text-emerald-600">0.00</span>
              </div>
              <div>
                <span className="text-slate-500">Closing: </span>
                <span className={`font-bold ${openingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {openingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t mt-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500">Total Slip: </span>
                <span className="font-bold text-blue-600">{records.filter(r => r.machineid === machine.id && r.date <= date).reduce((sum, r) => safeAdd(sum, calculateSlipTotal(r)), 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Total Statement: </span>
                <span className="font-bold text-emerald-600">{records.filter(r => r.machineid === machine.id && r.date <= date).reduce((sum, r) => safeAdd(sum, calculateStatementTotal(r)), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const openingBalance = calculateOpeningBalance(machine.id, date, records);
  const slipTotal = calculateSlipTotal(record);
  const statementTotal = calculateStatementTotal(record);
  const diff = calculateDifference(record);
  const calculatedClosing = calculateClosingBalance(machine.id, date, records);

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow" onClick={onClick}>
      <h3 className="font-bold text-lg text-blue-600 mb-3">{machine.name}</h3>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-blue-600 font-medium mb-2 border-b border-blue-200 pb-1">Slip</div>
            <Row label="Mada" value={parseAmount(record.mada)} />
            <Row label="Visa" value={parseAmount(record.visa)} />
            <Row label="MC" value={parseAmount(record.mastercard)} />
            <Row label="GCC" value={parseAmount(record.gcc)} />
            {record.extrafields && Object.entries(record.extrafields).map(([key, value]) => (
              <Row key={`slip-${key}`} label={key} value={parseAmount((value as any).slip)} />
            ))}
            <div className="border-t border-blue-200 pt-2 mt-2">
              <div className="flex justify-between items-center font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{slipTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 p-2 rounded">
            <div className="text-emerald-600 font-medium mb-2 border-b border-emerald-200 pb-1">Statement</div>
            <Row label="Mada" value={parseAmount(record.bankmada)} />
            <Row label="Visa" value={parseAmount(record.bankvisa)} />
            <Row label="MC" value={parseAmount(record.bankmastercard)} />
            <Row label="GCC" value={parseAmount(record.bankgcc)} />
            {record.extrafields && Object.entries(record.extrafields).map(([key, value]) => (
              <Row key={`stmt-${key}`} label={key} value={parseAmount((value as any).statement)} />
            ))}
            <div className="border-t border-emerald-200 pt-2 mt-2">
              <div className="flex justify-between items-center font-bold">
                <span>Total:</span>
                <span className="text-emerald-600">{statementTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="text-slate-500">Opening: </span>
              <span className={`font-bold ${openingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {openingBalance.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Diff: </span>
              <span className={`font-bold ${diff < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {(diff > 0 ? '+' : '') + diff.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Closing: </span>
              <span className={`font-bold ${calculatedClosing < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {calculatedClosing.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t mt-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500">Total Slip: </span>
                <span className="font-bold text-blue-600">{records.filter(r => r.machineid === machine.id && r.date <= date).reduce((sum, r) => safeAdd(sum, calculateSlipTotal(r)), 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Total Statement: </span>
                <span className="font-bold text-emerald-600">{records.filter(r => r.machineid === machine.id && r.date <= date).reduce((sum, r) => safeAdd(sum, calculateStatementTotal(r)), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EntryForm = React.memo<{
  machine: Machine;
  date: string;
  amounts: FormAmounts;
  records: ReconcileRecord[];
  initialExtraValues?: { [key: string]: { slip: string, statement: string } };
  onAmountChange: (field: keyof FormAmounts, value: string) => void;
  onSave: (extras: { [key: string]: { slip: string, statement: string } }) => void;
  onCancel: () => void;
  onClear: () => void;
  extraFieldValues: { [key: string]: { slip: string, statement: string } };
  setExtraFieldValues: React.Dispatch<React.SetStateAction<{ [key: string]: { slip: string, statement: string } }>>;
}>(({ machine, date, amounts, records, initialExtraValues, onAmountChange, onSave, onCancel, onClear, extraFieldValues: parentExtraFieldValues, setExtraFieldValues: setParentExtraFieldValues }) => {
  const [extraFields, setExtraFields] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    if (parentExtraFieldValues && Object.keys(parentExtraFieldValues).length > 0) {
      const fields: { [key: string]: string[] } = {};
      Object.keys(parentExtraFieldValues).forEach(key => {
        const type = key.split(' ')[0].toLowerCase();
        if (CARD_TYPES.includes(type as any)) {
          fields[type] = [...(fields[type] || []), key];
        }
      });
      setExtraFields(fields);
    } else {
      setExtraFields({});
    }
  }, [parentExtraFieldValues]);

  const extraFieldValues = parentExtraFieldValues;
  const setExtraFieldValues = setParentExtraFieldValues;
  const [isSaving, setIsSaving] = useState(false);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [formDate, setFormDate] = useState(date);
  const [showFormCalendar, setShowFormCalendar] = useState(false);
  const firstInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const machineRecords = useMemo(() => {
    return records.filter(r => r.machineid === machine.id).sort((a, b) => a.date.localeCompare(b.date));
  }, [records, machine.id]);

  const currentRecord = machineRecords[currentRecordIndex];

  useEffect(() => {
    setFormDate(date);
    const index = machineRecords.findIndex(r => r.date === date);
    setCurrentRecordIndex(index >= 0 ? index : 0);
  }, [machineRecords, date]);

  const { closingBalance, currentDifference, slipTotal, statementTotal } = useMemo(() => {
    const opening = calculateOpeningBalance(machine.id, formDate, records);

    const baseSlipTotal = safeAdd(
      parseAmount(amounts.mada),
      parseAmount(amounts.visa),
      parseAmount(amounts.mastercard),
      parseAmount(amounts.gcc)
    );

    const extraSlipTotal = Object.values(extraFieldValues).reduce((sum: number, field: { slip: string, statement: string }) =>
      safeAdd(sum, parseAmount(field?.slip)), 0);

    const slipTotal = safeAdd(baseSlipTotal, extraSlipTotal);

    const baseStatementTotal = safeAdd(
      parseAmount(amounts.bankMada),
      parseAmount(amounts.bankVisa),
      parseAmount(amounts.bankMastercard),
      parseAmount(amounts.bankGcc)
    );

    const extraStatementTotal = Object.values(extraFieldValues).reduce((sum: number, field: { slip: string, statement: string }) =>
      safeAdd(sum, parseAmount(field?.statement)), 0);

    const statementTotal = safeAdd(baseStatementTotal, extraStatementTotal);
    const currentDifference = safeSub(statementTotal, slipTotal);
    const closingBalance = safeAdd(opening, currentDifference);

    return { closingBalance, currentDifference, slipTotal, statementTotal };
  }, [amounts, extraFieldValues, machine.id, formDate, records]);

  const addExtraField = (cardType: string) => {
    const currentCount = (extraFields[cardType] || []).length;
    const newField = `${cardType} ${currentCount + 2}`;
    setExtraFields(prev => ({
      ...prev,
      [cardType]: [...(prev[cardType] || []), newField]
    }));
  };

  const removeExtraField = (cardType: string, fieldId: string) => {
    setExtraFields(prev => ({
      ...prev,
      [cardType]: (prev[cardType] || []).filter(f => f !== fieldId)
    }));
    setExtraFieldValues(prev => {
      const newValues = { ...prev };
      delete newValues[fieldId];
      return newValues;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentRow: number, currentCol: number) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();

      const allInputs = Array.from(document.querySelectorAll('input[data-r]')) as HTMLInputElement[];
      let targetInput: HTMLInputElement | undefined;

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const targetCol = e.key === 'ArrowRight' ? currentCol + 1 : currentCol - 1;
        targetInput = allInputs.find(input =>
          parseInt(input.dataset.r || '0') === currentRow &&
          parseInt(input.dataset.c || '0') === targetCol
        );
      } else {
        // For Up/Down, find the next row with the same column
        const sameColInputs = allInputs.filter(input => parseInt(input.dataset.c || '0') === currentCol);

        if (e.key === 'ArrowDown') {
          // Find smallest row > currentRow
          targetInput = sameColInputs
            .filter(input => parseInt(input.dataset.r || '0') > currentRow)
            .sort((a, b) => parseInt(a.dataset.r || '0') - parseInt(b.dataset.r || '0'))[0];
        } else {
          // Find largest row < currentRow
          targetInput = sameColInputs
            .filter(input => parseInt(input.dataset.r || '0') < currentRow)
            .sort((a, b) => parseInt(b.dataset.r || '0') - parseInt(a.dataset.r || '0'))[0];
        }
      }

      if (targetInput) {
        targetInput.focus();
        targetInput.select();
      }
    }
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave(extraFieldValues);
      // Success feedback handled by parent or local state if needed
      // But since parent closes form, we might want to delay closing?
      // Let's assume parent handles the close.
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-lg p-6 w-full max-w-xl mx-4">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => {
                const prevDate = new Date(formDate);
                prevDate.setDate(prevDate.getDate() - 1);
                const newDateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
                window.dispatchEvent(new CustomEvent('navigateToDate', { detail: { date: newDateStr, machineid: machine.id } }));
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-bold">
                {machine.name} -
                <button
                  type="button"
                  onClick={() => setShowFormCalendar(!showFormCalendar)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {new Date(formDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </button>
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextDate = new Date(formDate);
                nextDate.setDate(nextDate.getDate() + 1);
                const newDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
                window.dispatchEvent(new CustomEvent('navigateToDate', { detail: { date: newDateStr, machineid: machine.id } }));
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {showFormCalendar && (
            <div className="mb-4 bg-white rounded-lg shadow-xl border p-4">
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const currentDate = new Date(formDate);
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const days = [];

                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="aspect-square" />);
                  }

                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayRecord = records.find(r => r.date === dateStr && r.machineid === machine.id);
                    const isSelected = dateStr === formDate;
                    const hasRecord = !!dayRecord;
                    const dynamicClosing = calculateClosingBalance(machine.id, dateStr, records);

                    days.push(
                      <button
                        key={day}
                        onClick={() => {
                          setFormDate(dateStr);
                          setShowFormCalendar(false);
                        }}
                        className={`aspect-square rounded text-sm transition-all
                          ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}
                          ${hasRecord ? (dynamicClosing < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold') : ''}
                        `}
                      >
                        {day}
                      </button>
                    );
                  }
                  return days;
                })()}
              </div>
            </div>
          )}

          <div className="mb-4 bg-slate-50 p-3 rounded">
            <div className="flex justify-between text-sm">
              <span>Opening: <strong className={(() => { const ob = calculateOpeningBalance(machine.id, formDate, records); return ob < 0 ? 'text-red-600' : 'text-green-600'; })()}>{calculateOpeningBalance(machine.id, formDate, records).toFixed(2)}</strong></span>
              <span>Difference: <strong className={`${currentDifference < 0 ? 'text-red-600' : currentDifference > 0 ? 'text-green-600' : 'text-slate-600'}`}>{(currentDifference > 0 ? '+' : '') + currentDifference.toFixed(2)}</strong></span>
              <span>Closing: <strong className={`${closingBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>{closingBalance.toFixed(2)}</strong></span>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-3 gap-3 text-sm font-medium text-gray-600">
              <div>Card Type</div>
              <div className="text-center">Slip Amount</div>
              <div className="text-center">Statement Amount</div>
            </div>

            {CARD_TYPES.map((type, typeIndex) => (
              <div key={type} className="space-y-3">
                <div className="grid grid-cols-3 gap-3 items-center">
                  <label className="text-sm font-medium capitalize">{type}</label>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => addExtraField(type)}
                      className="text-blue-500 hover:text-blue-600 w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      tabIndex={-1}
                    >
                      +
                    </button>
                    <input
                      ref={typeIndex === 0 ? firstInputRef : null}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amounts[type]}
                      onChange={(e) => onAmountChange(type, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, typeIndex * 10, 0)}
                      data-r={typeIndex * 10}
                      data-c={0}
                      className="w-full p-3 border rounded text-sm"
                    />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amounts[`bank${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof FormAmounts]}
                    onChange={(e) => onAmountChange(`bank${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof FormAmounts, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, typeIndex * 10, 1)}
                    data-r={typeIndex * 10}
                    data-c={1}
                    className="w-full p-3 border rounded text-sm"
                  />
                </div>
                {extraFields[type]?.map((fieldId, fieldIndex) => (
                  <div key={fieldId} className="grid grid-cols-3 gap-3 items-center">
                    <div className="text-sm font-medium capitalize pl-8 flex items-center gap-2">
                      <span>{fieldId}</span>
                      <button
                        type="button"
                        onClick={() => removeExtraField(type, fieldId)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove field"
                        tabIndex={-1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => addExtraField(type)}
                        className="text-blue-500 hover:text-blue-600 w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        tabIndex={-1}
                      >
                        +
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={extraFieldValues[fieldId]?.slip || ''}
                        onChange={(e) => setExtraFieldValues(prev => ({
                          ...prev,
                          [fieldId]: { ...prev[fieldId], slip: e.target.value }
                        }))}
                        onKeyDown={(e) => handleKeyDown(e, typeIndex * 10 + fieldIndex + 1, 0)}
                        data-r={typeIndex * 10 + fieldIndex + 1}
                        data-c={0}
                        className="w-full p-3 border rounded text-sm"
                      />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={extraFieldValues[fieldId]?.statement || ''}
                      onChange={(e) => setExtraFieldValues(prev => ({
                        ...prev,
                        [fieldId]: { ...prev[fieldId], statement: e.target.value }
                      }))}
                      onKeyDown={(e) => handleKeyDown(e, typeIndex * 10 + fieldIndex + 1, 1)}
                      data-r={typeIndex * 10 + fieldIndex + 1}
                      data-c={1}
                      className="w-full p-3 border rounded text-sm"
                    />
                  </div>
                ))}
              </div>
            ))}

            <div className="grid grid-cols-3 gap-3 text-sm font-medium border-t pt-3 mt-4">
              <div></div>
              <div className="text-center text-blue-600">
                Total: {(
                  CARD_TYPES.reduce((sum, type) =>
                    safeAdd(sum, parseAmount(amounts[type])), 0) +
                  Object.values(extraFieldValues).reduce((sum, field) =>
                    safeAdd(sum, parseAmount(field?.slip)), 0)
                ).toFixed(2)}
              </div>
              <div className="text-center text-emerald-600">
                Total: {(
                  CARD_TYPES.reduce((sum, type) =>
                    safeAdd(sum, parseAmount(amounts[`bank${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof FormAmounts])), 0) +
                  Object.values(extraFieldValues).reduce((sum, field) =>
                    safeAdd(sum, parseAmount(field?.statement)), 0)
                ).toFixed(2)}
              </div>
            </div>

          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
              Cancel
            </button>
            <button
              type="button"
              onClick={onClear}
              className="flex-1 bg-orange-500 text-white p-2 rounded hover:bg-orange-600"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaving}
              className={`flex-1 p-2 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isSaving ? 'bg-green-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export const QuickEntry: React.FC = () => {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [records, setRecords] = useState<ReconcileRecord[]>([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [amounts, setAmounts] = useState<FormAmounts>({
    openingBalance: '',
    mada: '',
    visa: '',
    mastercard: '',
    gcc: '',
    bankMada: '',
    bankVisa: '',
    bankMastercard: '',
    bankGcc: ''
  });
  const [extraValues, setExtraValues] = useState<{ [key: string]: { slip: string, statement: string } }>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchAmount, setSearchAmount] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const todayRecords = useMemo(() => records.filter(r => r.date === date), [records, date]);

  useEffect(() => {
    clearBalanceCache();
  }, [records]);

  const recordsKey = useMemo(() => records.map(r => `${r.id}-${r.timestamp}`).join(','), [records]);
  const selectedMachineData = useMemo(() => machines.find(m => m.id === selectedMachine), [machines, selectedMachine]);

  const searchResults = useMemo(() => {
    if (!searchAmount) return [];
    return records.filter(r =>
      [r.mada, r.visa, r.mastercard, r.gcc, r.bankmada, r.bankvisa, r.bankmastercard, r.bankgcc]
        .some(amt => amt && amt.toString().startsWith(searchAmount))
    ).slice(0, 10);
  }, [records, searchAmount]);

  useEffect(() => {
    let isMounted = true;

    if (user) {
      setLoading(true);

      const loadData = async () => {
        try {
          const [machinesData, recordsData] = await Promise.all([
            getMachines(user.id),
            getRecords(user.id)
          ]);

          if (isMounted) {
            setMachines(machinesData);
            setRecords(recordsData);
          }

          const { getBusiness } = await import('../services/storageService');
          const businessData = await getBusiness(user.id);

          if (isMounted) {
            setBusiness(businessData);
            setLoading(false);
          }

        } catch (error) {
          console.error('Error loading data:', error);
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Close calendar on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showCalendar && !target.closest('.calendar-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  // Listen for records cleared event from sidebar
  useEffect(() => {
    const handleRecordsCleared = () => {
      setRecords(prev => prev.filter(r => r.date !== date));
    };

    const handleExportToExcel = () => {
      const BOM = "\uFEFF"; // Byte Order Mark for Excel UTF-8 compatibility
      const headers = ['Machine', 'Opening', 'Slip Mada', 'Slip Visa', 'Slip MC', 'Slip GCC', 'Bank Mada', 'Bank Visa', 'Bank MC', 'Bank GCC', 'Difference', 'Closing'];

      const rows = machines.map(machine => {
        const record = todayRecords.find(r => r.machineid === machine.id);
        const sortedPrevRecords = records.filter(r => r.machineid === machine.id && r.date < date).sort((a, b) => b.date.localeCompare(a.date));
        const openingBalance = sortedPrevRecords[0] ? Number(sortedPrevRecords[0].closingbalance || 0) : 0;

        if (record) {
          const diff = Number(record.difference || 0);
          const closing = openingBalance + diff;
          return [
            machine.name,
            openingBalance.toFixed(2),
            Number(record.mada || 0).toFixed(2),
            Number(record.visa || 0).toFixed(2),
            Number(record.mastercard || 0).toFixed(2),
            Number(record.gcc || 0).toFixed(2),
            Number(record.bankmada || 0).toFixed(2),
            Number(record.bankvisa || 0).toFixed(2),
            Number(record.bankmastercard || 0).toFixed(2),
            Number(record.bankgcc || 0).toFixed(2),
            diff.toFixed(2),
            closing.toFixed(2)
          ];
        } else {
          return [machine.name, openingBalance.toFixed(2), '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', openingBalance.toFixed(2)];
        }
      });

      const escapeCsv = (val: any) => {
        const str = String(val || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = BOM + [
        headers.join(','),
        ...rows.map(row => row.map(escapeCsv).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `reconcile-${date}.csv`;
      a.setAttribute('type', 'text/csv');
      document.body.appendChild(a); // Append to body
      a.click();
      setTimeout(() => {
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(url);
      }, 100);
    };

    const handlePrintDashboard = () => {
      window.print();
    };

    const handleClearSelectedDate = async () => {
      try {
        const { deleteRecord } = await import('../services/storageService');
        const recordsToDelete = records.filter(r => r.userid === user?.id && r.date === date);
        await Promise.allSettled(recordsToDelete.map(r => deleteRecord(r.id)));

        const localRecords = JSON.parse(localStorage.getItem('rpro_records') || '[]');
        localStorage.setItem('rpro_records', JSON.stringify(localRecords.filter((r: any) => r.date !== date)));

        setRecords(prev => prev.filter(r => r.date !== date));
      } catch (error) {
        console.error('Error clearing records:', error);
        alert('Failed to clear records. Please try again.');
      }
    };

    window.addEventListener('recordsCleared', handleRecordsCleared);
    window.addEventListener('exportToExcel', handleExportToExcel);
    window.addEventListener('printDashboard', handlePrintDashboard);
    window.addEventListener('clearSelectedDate', handleClearSelectedDate);
    return () => {
      window.removeEventListener('recordsCleared', handleRecordsCleared);
      window.removeEventListener('exportToExcel', handleExportToExcel);
      window.removeEventListener('printDashboard', handlePrintDashboard);
      window.removeEventListener('clearSelectedDate', handleClearSelectedDate);
    };
  }, [date, machines, todayRecords, records]);

  const resetForm = () => {
    setAmounts({
      openingBalance: '',
      mada: '',
      visa: '',
      mastercard: '',
      gcc: '',
      bankMada: '',
      bankVisa: '',
      bankMastercard: '',
      bankGcc: ''
    });
    setExtraValues({});
    setSelectedMachine('');
    setShowForm(false);
  };

  const handleSave = useCallback(async (extraValuesInput: { [key: string]: { slip: string, statement: string } }) => {
    if (!user || !selectedMachine) return;

    try {
      // Parse raw entry amounts
      const mada = parseAmount(amounts.mada);
      const visa = parseAmount(amounts.visa);
      const mastercard = parseAmount(amounts.mastercard);
      const gcc = parseAmount(amounts.gcc);

      const bankMada = parseAmount(amounts.bankMada);
      const bankVisa = parseAmount(amounts.bankVisa);
      const bankMastercard = parseAmount(amounts.bankMastercard);
      const bankGcc = parseAmount(amounts.bankGcc);

      // Calculate extra fields totals for empty check only
      let extraSlipTotal = 0;
      let extraStatementTotal = 0;

      Object.values(extraValuesInput).forEach((value) => {
        const slip = parseAmount(value.slip);
        const statement = parseAmount(value.statement);
        extraSlipTotal = safeAdd(extraSlipTotal, slip);
        extraStatementTotal = safeAdd(extraStatementTotal, statement);
      });

      const existingRecord = todayRecords.find(r => r.machineid === selectedMachine);

      const allEmpty = mada === 0 && visa === 0 && mastercard === 0 && gcc === 0 &&
        bankMada === 0 && bankVisa === 0 && bankMastercard === 0 && bankGcc === 0 &&
        extraSlipTotal === 0 && extraStatementTotal === 0;

      if (allEmpty && existingRecord) {
        const { deleteRecord } = await import('../services/storageService');
        await deleteRecord(existingRecord.id);
        const updatedRecords = await getRecords(user.id);
        setRecords(updatedRecords);
        resetForm();
        return;
      }

      if (allEmpty) {
        resetForm();
        return;
      }

      // Prepare extra fields for save
      const extraFieldsForSave: { [key: string]: { slip: number; statement: number } } = {};
      Object.entries(extraValuesInput).forEach(([key, value]) => {
        if (value && (value.slip || value.statement)) {
          extraFieldsForSave[key] = {
            slip: parseAmount(value.slip),
            statement: parseAmount(value.statement)
          };
        }
      });

      // Only save RAW ENTRY AMOUNTS to database - NO calculated values
      const record: ReconcileRecord = {
        id: existingRecord?.id || generateId(),
        userid: user.id,
        machineid: selectedMachine,
        date,
        // Raw entry amounts only
        mada,
        visa,
        mastercard,
        gcc,
        bankmada: bankMada,
        bankvisa: bankVisa,
        bankmastercard: bankMastercard,
        bankgcc: bankGcc,
        extrafields: Object.keys(extraFieldsForSave).length > 0 ? extraFieldsForSave : null,
        timestamp: Date.now()
        // NOTE: openingbalance, closingbalance, difference, machinetotal, bankcredit 
        // are NOT saved - they are calculated by frontend when needed
      };

      await saveRecord(record);

      clearBalanceCache();

      const updatedRecords = await getRecords(user.id);
      setRecords(updatedRecords);

      resetForm();
    } catch (error: any) {
      console.error("Error saving record:", error);
      console.error("Error details:", error.message, error.code, error.details);
      alert(`Failed to save record: ${error.message || 'Please try again.'}`);
      throw error;
    } finally {
      // setIsSaving(false); // This is now managed by EntryForm
    }
  }, [user, selectedMachine, amounts, todayRecords, date]); // Removed isSaving from dependency array

  const handleMachineClick = useCallback((machineId: string, targetDate?: string) => {
    const effectiveDate = targetDate || date;
    const record = records.find(r => r.machineid === machineId && r.date === effectiveDate);
    setSelectedMachine(machineId);

    const sortedPrevRecords = records
      .filter(r => r.machineid === machineId && r.date < effectiveDate)
      .sort((a, b) => b.date.localeCompare(a.date));

    const lastRecord = sortedPrevRecords[0];
    const correctOpeningBalance = lastRecord ? String(lastRecord.closingbalance || 0) : '0';

    if (record) {
      setAmounts({
        openingBalance: correctOpeningBalance,
        mada: String(record.mada || ''),
        visa: String(record.visa || ''),
        mastercard: String(record.mastercard || ''),
        gcc: String(record.gcc || ''),
        bankMada: String(record.bankmada || ''),
        bankVisa: String(record.bankvisa || ''),
        bankMastercard: String(record.bankmastercard || ''),
        bankGcc: String(record.bankgcc || '')
      });

      if (record.extrafields && Object.keys(record.extrafields).length > 0) {
        const loadedExtras: { [key: string]: { slip: string, statement: string } } = {};
        Object.entries(record.extrafields).forEach(([key, value]) => {
          const val = value as { slip: number; statement: number };
          loadedExtras[key] = {
            slip: String(val.slip || ''),
            statement: String(val.statement || '')
          };
        });
        setExtraValues(loadedExtras);
      } else {
        setExtraValues({});
      }
    } else {
      resetForm();
      setSelectedMachine(machineId);
      setAmounts(prev => ({
        ...prev,
        openingBalance: correctOpeningBalance
      }));
      setExtraValues({});
    }

    setShowForm(true);
  }, [records, date]);

  // Handle navigation from search results
  useEffect(() => {
    const handleNavigateToDate = (event: CustomEvent) => {
      const detail = event.detail;
      if (typeof detail === 'string') {
        // Old format - just date
        setDate(detail);
      } else {
        // New format - { date, machineId }
        setDate(detail.date);
        if (detail.machineid) {
          // Pass the target date directly to handleMachineClick
          setTimeout(() => {
            handleMachineClick(detail.machineid, detail.date);
            setShowForm(true);
          }, 50);
        }
      }
      setShowCalendar(false);
    };

    window.addEventListener('navigateToDate', handleNavigateToDate as EventListener);
    return () => {
      window.removeEventListener('navigateToDate', handleNavigateToDate as EventListener);
    };
  }, [handleMachineClick]);

  const handleAmountChange = useCallback((field: keyof FormAmounts, value: string) => {
    setAmounts(prev => ({ ...prev, [field]: value }));
  }, []);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    const newDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    setDate(newDateStr);
  }, [date]);





  const totalBalances = useMemo(() => {
    let totalOpening = 0;
    let totalClosing = 0;
    let totalDiff = 0;
    let totalSlip = 0;
    let totalStatement = 0;

    machines.forEach(machine => {
      const todayRecord = todayRecords.find(r => r.machineid === machine.id);

      const openingBalance = calculateOpeningBalance(machine.id, date, records);
      totalOpening = safeAdd(totalOpening, openingBalance);

      if (todayRecord) {
        const calculatedClosing = calculateClosingBalance(machine.id, date, records);
        const diff = calculateDifference(todayRecord);
        const machineSlipTotal = calculateSlipTotal(todayRecord);
        const statementTotal = calculateStatementTotal(todayRecord);

        totalClosing = safeAdd(totalClosing, calculatedClosing);
        totalDiff = safeAdd(totalDiff, diff);
        totalSlip = safeAdd(totalSlip, machineSlipTotal);
        totalStatement = safeAdd(totalStatement, statementTotal);
      } else {
        // If no record for today, closing = opening (no change)
        totalClosing = safeAdd(totalClosing, openingBalance);
      }
    });
    return { totalOpening, totalClosing, totalDiff, totalSlip, totalStatement };
  }, [todayRecords, machines, records, date]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Print Header - Visible only when printing */}
      <div className="print-header">
        <h1>{business?.name || 'Reconciliation Report'}</h1>
        <p>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        {business && (
          <p>
            {business.phone && <span>{business.phone} | </span>}
            {business.email && <span>{business.email}</span>}
          </p>
        )}
      </div>

      {/* Print-Only Table View */}
      <div className="print-only">
        <table className="print-table">
          <thead>
            <tr>
              <th>Machine</th>
              <th>Opening</th>
              <th colSpan={4} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>Slip Totals</th>
              <th colSpan={4} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>Bank Totals</th>
              <th>Difference</th>
              <th>Closing</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th>Mada</th>
              <th>Visa</th>
              <th>MC</th>
              <th>GCC</th>
              <th>Mada</th>
              <th>Visa</th>
              <th>MC</th>
              <th>GCC</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {machines.map(machine => {
              const record = todayRecords.find(r => r.machineid === machine.id);
              const openingBalance = calculateOpeningBalance(machine.id, date, records);

              if (record) {
                const diff = parseAmount(record.difference);
                const closing = safeAdd(openingBalance, diff);

                return (
                  <tr key={machine.id}>
                    <td style={{ fontWeight: 'bold' }}>{machine.name}</td>
                    <td style={{ textAlign: 'right' }}>{openingBalance.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{parseAmount(record.mada).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{parseAmount(record.visa).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{parseAmount(record.mastercard).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{parseAmount(record.gcc).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{parseAmount(record.bankmada).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{parseAmount(record.bankvisa).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{parseAmount(record.bankmastercard).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{parseAmount(record.bankgcc).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', color: diff < 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                      {(diff > 0 ? '+' : '') + diff.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', color: closing < 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                      {closing.toFixed(2)}
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={machine.id}>
                    <td style={{ fontWeight: 'bold' }}>{machine.name}</td>
                    <td style={{ textAlign: 'right' }}>{openingBalance.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right', color: openingBalance < 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                      {openingBalance.toFixed(2)}
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '11pt' }}>
              <td>TOTAL</td>
              <td style={{ textAlign: 'right' }}>{totalBalances.totalOpening.toFixed(2)}</td>
              <td colSpan={4} style={{ textAlign: 'center', borderRight: '1px solid #ddd' }}>
                Slip: {totalBalances.totalSlip.toFixed(2)}
              </td>
              <td colSpan={4} style={{ textAlign: 'center', borderRight: '1px solid #ddd' }}>
                Statement: {totalBalances.totalStatement.toFixed(2)}
              </td>
              <td style={{ textAlign: 'right', color: totalBalances.totalDiff < 0 ? '#dc2626' : '#16a34a' }}>
                {(totalBalances.totalDiff > 0 ? '+' : '') + totalBalances.totalDiff.toFixed(2)}
              </td>
              <td style={{ textAlign: 'right', color: totalBalances.totalClosing < 0 ? '#dc2626' : '#16a34a' }}>
                {totalBalances.totalClosing.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6 no-print">
        <div className="md:hidden text-center mb-4">
          <h2 className="text-xl font-bold">{business?.name || 'My Business'}</h2>
          {business && (
            <div className="text-sm text-slate-600 mt-1">
              {business.address && <span>{business.address} • </span>}
              {business.phone && <span>{business.phone} • </span>}
              {business.email && <span>{business.email}</span>}
              {business.taxId && <div className="mt-1">Tax ID: {business.taxId}</div>}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-8 text-sm sm:text-base mb-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Opening:</span>
            <span className={`font-semibold ${totalBalances.totalOpening < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalBalances.totalOpening.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Difference:</span>
            <span className={`font-semibold ${totalBalances.totalDiff < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {(totalBalances.totalDiff > 0 ? '+' : '') + totalBalances.totalDiff.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Closing:</span>
            <span className={`font-bold ${totalBalances.totalClosing < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalBalances.totalClosing.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 border-t pt-4">
          <button onClick={() => navigateDate('prev')} className="p-3 hover:bg-slate-100 rounded">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div
            onClick={() => setShowCalendar(!showCalendar)}
            className="p-2 text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded transition-colors text-black whitespace-nowrap"
          >
            <Calendar className="w-4 h-4" />
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
          <button onClick={() => navigateDate('next')} className="p-3 hover:bg-slate-100 rounded">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {showCalendar && (
        <div className="calendar-container mt-4 mb-6 bg-white rounded-lg shadow-xl border p-4 z-50 max-w-sm mx-auto no-print">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                const currentDate = new Date(date);
                currentDate.setMonth(currentDate.getMonth() - 1);
                const newDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                setDate(newDateStr);
              }}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-semibold">
              {new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => {
                const currentDate = new Date(date);
                currentDate.setMonth(currentDate.getMonth() + 1);
                const newDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                setDate(newDateStr);
              }}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const currentDate = new Date(date);
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth();
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const today = (() => {
                const t = new Date();
                return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
              })();

              const days = [];

              // Empty cells for days before month starts
              for (let i = 0; i < firstDay; i++) {
                days.push(<div key={`empty-${i}`} className="aspect-square" />);
              }

              // Days of the month
              for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayRecords = records.filter(r => r.date === dateStr);
                const isSelected = dateStr === date;
                const isToday = dateStr === today;

                let totalClosing = 0;
                machines.forEach(machine => {
                  totalClosing += calculateClosingBalance(machine.id, dateStr, records);
                });

                days.push(
                  <button
                    key={day}
                    onClick={() => {
                      setDate(dateStr);
                      setShowCalendar(false);
                    }}
                    className={`aspect-square rounded-lg text-sm font-medium transition-all relative
                      ${isSelected ? 'ring-2 ring-blue-600 font-bold' : 'hover:bg-slate-100'}
                      ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}
                      ${dayRecords.length > 0 ? (totalClosing < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold') : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              }

              return days;
            })()}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-slate-600">Positive</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-600">Negative</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-slate-600">Neutral</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 no-print">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machines.map(machine => (
            <MachineCard
              key={`${machine.id}-${recordsKey}`}
              machine={machine}
              record={todayRecords.find(r => r.machineid === machine.id)}
              records={records}
              date={date}
              onClick={() => handleMachineClick(machine.id)}
            />
          ))}
        </div>

        {/* Summary Totals - Bottom of Page */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-4 mt-4 no-print space-y-3" key={`summary-${recordsKey}`}>
          <div className="flex items-center justify-center gap-8 text-base font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Total Machines:</span>
              <span className="text-slate-800 text-lg">{machines.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Total Slip:</span>
              <span className="text-blue-600 text-lg">{totalBalances.totalSlip.toFixed(2)}</span>
            </div>
            <div className="h-6 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Total Statement:</span>
              <span className="text-purple-600 text-lg">{totalBalances.totalStatement.toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-center gap-8 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">All Time Slip:</span>
                <span className="text-blue-700 text-base">{(() => {
                  const total = records.filter(r => r.date <= date).reduce((sum, r) => safeAdd(sum, calculateSlipTotal(r)), 0);
                  return total.toFixed(2);
                })()}</span>
              </div>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">All Time Statement:</span>
                <span className="text-purple-700 text-base">{(() => {
                  const total = records.filter(r => r.date <= date).reduce((sum, r) => safeAdd(sum, calculateStatementTotal(r)), 0);
                  return total.toFixed(2);
                })()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Clear Entry</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to clear this entry? This will delete all data for this machine on this date.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const record = records.find(r => r.machineid === selectedMachine && r.date === date);
                  if (record) {
                    const { deleteRecord } = await import('../services/storageService');
                    await deleteRecord(record.id);
                    if (user) {
                      const updatedRecords = await getRecords(user.id);
                      setRecords(updatedRecords);
                    }
                  }
                  Object.keys(amounts).forEach(key => {
                    if (key !== 'openingBalance') {
                      handleAmountChange(key as keyof FormAmounts, '');
                    }
                  });
                  setExtraValues({});
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && selectedMachineData && (
        <EntryForm
          machine={selectedMachineData}
          date={date}
          amounts={amounts}
          records={records}
          initialExtraValues={extraValues}
          onAmountChange={handleAmountChange}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          onClear={() => setShowClearConfirm(true)}
          extraFieldValues={extraValues}
          setExtraFieldValues={setExtraValues}
        />
      )}
    </div>
  );
};
