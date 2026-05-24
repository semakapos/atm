
export interface Machine {
  id: string;
  userid: string;
  name: string;
  bankname: string;
  active: boolean;
}

export interface ReconcileRecord {
  id: string;
  userid: string;
  machineid: string;
  date: string;
  // Entry amounts (saved to database)
  mada: number;
  visa: number;
  mastercard: number;
  gcc: number;
  bankmada?: number;
  bankvisa?: number;
  bankmastercard?: number;
  bankgcc?: number;
  extrafields?: { [key: string]: { slip: number; statement: number } } | null;
  notes?: string;
  timestamp: number;
  // Calculated fields (NOT saved to database - computed by frontend)
  openingbalance?: number;
  closingbalance?: number;
  machinetotal?: number;
  bankcredit?: number;
  difference?: number;
}

export interface DailySummary {
  date: string;
  totalMachine: number;
  totalBank: number;
  totalDifference: number;
  recordCount: number;
}
