import { Machine, ReconcileRecord } from '../types';

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  userid: string;
}

interface SyncQueue {
  id: string;
  type: 'machine' | 'record' | 'business';
  action: 'save' | 'delete';
  data: any;
  timestamp: number;
}

const STORAGE_KEYS = {
  machines: 'rpro_machines',
  records: 'rpro_records',
  business: 'rpro_business',
  syncQueue: 'rpro_sync_queue',
  lastSync: 'rpro_last_sync'
};

export class OfflineService {
  static isOnline(): boolean {
    return navigator.onLine;
  }

  // Local Storage Operations
  static getMachines(userId: string): Machine[] {
    const data = localStorage.getItem(STORAGE_KEYS.machines);
    if (!data) return [];
    const machines = JSON.parse(data);
    return machines.filter((m: Machine) => m.userid === userId);
  }

  static saveMachineLocal(machine: Machine): void {
    const machines = this.getAllMachines();
    const index = machines.findIndex(m => m.id === machine.id);
    if (index >= 0) {
      machines[index] = machine;
    } else {
      machines.push(machine);
    }
    localStorage.setItem(STORAGE_KEYS.machines, JSON.stringify(machines));
    this.addToSyncQueue('machine', 'save', machine);
  }

  static deleteMachineLocal(id: string): void {
    const machines = this.getAllMachines().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.machines, JSON.stringify(machines));
    this.addToSyncQueue('machine', 'delete', { id });
  }

  static getRecords(userId: string): ReconcileRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.records);
    if (!data) return [];
    const records = JSON.parse(data);
    return records.filter((r: ReconcileRecord) => r.userid === userId);
  }

  static saveRecordLocal(record: ReconcileRecord): void {
    const records = this.getAllRecords();
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
    this.addToSyncQueue('record', 'save', record);
  }

  static deleteRecordLocal(id: string): void {
    const records = this.getAllRecords().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
    this.addToSyncQueue('record', 'delete', { id });
  }

  static getBusiness(userId: string): BusinessInfo | null {
    const data = localStorage.getItem(STORAGE_KEYS.business);
    if (!data) return null;
    const businesses = JSON.parse(data);
    return businesses.find((b: BusinessInfo) => b.userid === userId) || null;
  }

  static saveBusinessLocal(business: BusinessInfo): void {
    const businesses = this.getAllBusinesses();
    const index = businesses.findIndex(b => b.userid === business.userid);
    if (index >= 0) {
      businesses[index] = business;
    } else {
      businesses.push(business);
    }
    localStorage.setItem(STORAGE_KEYS.business, JSON.stringify(businesses));
    this.addToSyncQueue('business', 'save', business);
  }

  // Sync Queue Management
  static forceQueueSync(type: SyncQueue['type'], action: SyncQueue['action'], data: any): void {
    const queue = this.getSyncQueue();
    const syncItem: SyncQueue = {
      id: `${type}_${action}_${Date.now()}`,
      type,
      action,
      data,
      timestamp: Date.now()
    };
    queue.push(syncItem);
    localStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify(queue));
  }

  private static addToSyncQueue(type: SyncQueue['type'], action: SyncQueue['action'], data: any): void {
    if (this.isOnline()) return; // Don't queue if online (caller will try direct save)
    this.forceQueueSync(type, action, data);
  }

  static getSyncQueue(): SyncQueue[] {
    const data = localStorage.getItem(STORAGE_KEYS.syncQueue);
    return data ? JSON.parse(data) : [];
  }

  static clearSyncQueue(): void {
    localStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify([]));
  }

  // Sync with Firebase
  static async syncWithFirebase(firebaseService: any): Promise<void> {
    if (!this.isOnline()) return;

    const queue = this.getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} items...`);

    for (const item of queue) {
      try {
        switch (item.type) {
          case 'machine':
            if (item.action === 'save') {
              await firebaseService.saveMachine(item.data);
            } else {
              await firebaseService.deleteMachine(item.data.id);
            }
            break;
          case 'record':
            if (item.action === 'save') {
              await firebaseService.saveRecord(item.data);
            } else {
              await firebaseService.deleteRecord(item.data.id);
            }
            break;
          case 'business':
            await firebaseService.saveBusiness(item.data);
            break;
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }

    this.clearSyncQueue();
    localStorage.setItem(STORAGE_KEYS.lastSync, Date.now().toString());
    console.log('Sync completed');
  }

  // Load from Firebase and update local storage
  static async loadFromFirebase(userId: string, firebaseService: any): Promise<void> {
    if (!this.isOnline()) return;

    try {
      const [machines, records, business] = await Promise.all([
        firebaseService.getMachines(userId),
        firebaseService.getRecords(userId),
        firebaseService.getBusiness(userId)
      ]);

      localStorage.setItem(STORAGE_KEYS.machines, JSON.stringify(machines));
      localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));

      const businesses = business ? [business] : [];
      localStorage.setItem(STORAGE_KEYS.business, JSON.stringify(businesses));

      localStorage.setItem(STORAGE_KEYS.lastSync, Date.now().toString());
    } catch (error) {
      console.error('Load from Firebase error:', error);
    }
  }

  // Helper methods
  private static getAllMachines(): Machine[] {
    const data = localStorage.getItem(STORAGE_KEYS.machines);
    return data ? JSON.parse(data) : [];
  }

  private static getAllRecords(): ReconcileRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.records);
    return data ? JSON.parse(data) : [];
  }

  private static getAllBusinesses(): BusinessInfo[] {
    const data = localStorage.getItem(STORAGE_KEYS.business);
    return data ? JSON.parse(data) : [];
  }

  static getLastSyncTime(): number {
    const time = localStorage.getItem(STORAGE_KEYS.lastSync);
    return time ? parseInt(time) : 0;
  }
}