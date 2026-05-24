import { supabase } from './supabase';
import { Machine, ReconcileRecord } from '../types';

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  userid: string;
}

const MACHINES_COLLECTION = 'machines';
const RECORDS_COLLECTION = 'records';
const BUSINESS_COLLECTION = 'businesses';

// Helper to generate IDs with fallback for older browsers
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const getMachines = async (userId: string): Promise<Machine[]> => {
  const { data, error } = await supabase.from(MACHINES_COLLECTION).select('*').eq('userid', userId);
  if (error) throw error;
  return data as Machine[];
};

export const saveMachine = async (machine: Machine) => {
  if (!machine.userid) throw new Error("User ID is required to save a machine.");
  console.log('Saving machine to Supabase:', machine);
  const { data, error } = await supabase.from(MACHINES_COLLECTION).upsert(machine);
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  console.log('Machine saved successfully:', data);
};

export const deleteMachine = async (id: string) => {
  const { error } = await supabase.from(MACHINES_COLLECTION).delete().eq('id', id);
  if (error) throw error;
};

export const getRecords = async (userId: string): Promise<ReconcileRecord[]> => {
  const { data, error } = await supabase.from(RECORDS_COLLECTION).select('*').eq('userid', userId);
  if (error) throw error;
  const records = data as ReconcileRecord[];
  return records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
};

export const saveRecord = async (record: ReconcileRecord) => {
  if (!record.id) throw new Error("Record must have an ID to be saved");
  if (!record.userid) throw new Error("User ID is required to save a record.");

  const fullRecord = { ...record, timestamp: record.timestamp || Date.now() };
  console.log('Saving record to Supabase:', fullRecord);
  const { data, error } = await supabase.from(RECORDS_COLLECTION).upsert(fullRecord);
  if (error) {
    console.error('Supabase record save error:', error);
    throw error;
  }
  console.log('Record saved successfully:', data);
};

export const deleteRecord = async (id: string) => {
  const { error } = await supabase.from(RECORDS_COLLECTION).delete().eq('id', id);
  if (error) throw error;
};

export const getBusiness = async (userId: string): Promise<BusinessInfo | null> => {
  const { data, error } = await supabase.from(BUSINESS_COLLECTION).select('*').eq('userid', userId).maybeSingle();
  if (error) throw error;
  return data as BusinessInfo | null;
};

export const saveBusiness = async (business: BusinessInfo) => {
  if (!business.userid) throw new Error("User ID is required to save business info.");
  const { error } = await supabase.from(BUSINESS_COLLECTION).upsert(business);
  if (error) throw error;
};

export const saveRecordsBatch = async (records: ReconcileRecord[]) => {
  if (records.length === 0) return;
  const { error } = await supabase.from(RECORDS_COLLECTION).upsert(records);
  if (error) throw error;
};

export const initializeStorage = async (userId: string) => {
  console.log("Storage initialized for user:", userId);
};
