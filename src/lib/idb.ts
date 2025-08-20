import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Session {
  id: string;
  type: 'work' | 'break' | 'lunch' | 'dinner' | 'tech' | 'custom';
  start_ts: string; // ISO UTC
  end_ts: string | null; // nullable while running
  duration_ms: number | null;
  note: string;
  tags: string[];
  project: string | null;
  manual: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Settings {
  timeFormat: 'AMPM';
  locale: string;
  encryptBackup: boolean;
  autoBackupDays: number;
}

export interface AuditLog {
  id: string;
  session_id: string;
  action: 'edit' | 'delete' | 'create';
  payload: any;
  timestamp: string;
}

interface TimeTrackerDB extends DBSchema {
  sessions: {
    key: string;
    value: Session;
    indexes: { 'by-start': string; 'by-type': string };
  };
  projects: {
    key: string;
    value: Project;
  };
  settings: {
    key: string;
    value: any;
  };
  audit_log: {
    key: string;
    value: AuditLog;
    indexes: { 'by-session': string };
  };
}

let dbInstance: IDBPDatabase<TimeTrackerDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<TimeTrackerDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<TimeTrackerDB>('TimeTrackerDB', 1, {
    upgrade(db) {
      // Sessions store
      const sessionsStore = db.createObjectStore('sessions', {
        keyPath: 'id'
      });
      sessionsStore.createIndex('by-start', 'start_ts');
      sessionsStore.createIndex('by-type', 'type');

      // Projects store
      db.createObjectStore('projects', {
        keyPath: 'id'
      });

      // Settings store
      db.createObjectStore('settings');

      // Audit log
      const auditStore = db.createObjectStore('audit_log', {
        keyPath: 'id'
      });
      auditStore.createIndex('by-session', 'session_id');
    },
  });

  // Initialize default settings
  const tx = dbInstance.transaction('settings', 'readwrite');
  const existingSettings = await tx.store.get('main');
  if (!existingSettings) {
    await tx.store.put({
      timeFormat: 'AMPM',
      locale: 'en-IN',
      encryptBackup: false,
      autoBackupDays: 7
    }, 'main');
  }
  await tx.done;

  return dbInstance;
}

export class SessionService {
  static async create(session: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Promise<Session> {
    const db = await getDB();
    const now = new Date().toISOString();
    const newSession: Session = {
      ...session,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now
    };

    await db.add('sessions', newSession);
    return newSession;
  }

  static async update(id: string, updates: Partial<Session>): Promise<Session | null> {
    const db = await getDB();
    const existing = await db.get('sessions', id);
    if (!existing) return null;

    const updated: Session = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await db.put('sessions', updated);
    return updated;
  }

  static async getById(id: string): Promise<Session | null> {
    const db = await getDB();
    return (await db.get('sessions', id)) || null;
  }

  static async getByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(startDate, endDate);
    return db.getAllFromIndex('sessions', 'by-start', range);
  }

  static async getRunningSession(): Promise<Session | null> {
    const db = await getDB();
    const sessions = await db.getAll('sessions');
    return sessions.find(s => s.end_ts === null) || null;
  }

  static async delete(id: string): Promise<boolean> {
    const db = await getDB();
    try {
      await db.delete('sessions', id);
      return true;
    } catch {
      return false;
    }
  }

  static async stopRunning(): Promise<Session | null> {
    const running = await this.getRunningSession();
    if (!running) return null;

    const endTime = new Date().toISOString();
    const startTime = new Date(running.start_ts);
    const duration = new Date(endTime).getTime() - startTime.getTime();

    return this.update(running.id, {
      end_ts: endTime,
      duration_ms: duration
    });
  }
}
