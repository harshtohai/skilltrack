import fs from 'fs';
import path from 'path';
import {
  User,
  District,
  Provider,
  Course,
  Batch,
  Trainee,
  Consent,
  Enrolment,
  Employer,
  Outcome,
  Followup,
  EmployerDemand,
  Alert,
  AuditLog
} from '../src/types.ts';

export interface DatabaseState {
  users: User[];
  districts: District[];
  providers: Provider[];
  courses: Course[];
  batches: Batch[];
  trainees: Trainee[];
  consents: Consent[];
  enrolments: Enrolment[];
  employers: Employer[];
  outcomes: Outcome[];
  followups: Followup[];
  employer_demands: EmployerDemand[];
  alerts: Alert[];
  audit_log: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseState = {
    users: [],
    districts: [],
    providers: [],
    courses: [],
    batches: [],
    trainees: [],
    consents: [],
    enrolments: [],
    employers: [],
    outcomes: [],
    followups: [],
    employer_demands: [],
    alerts: [],
    audit_log: []
  };

  private initialized = false;

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      }
    } catch (err) {
      console.error('Failed to load database from file, initializing fresh:', err);
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // Generic helpers
  public getState(): DatabaseState {
    return this.data;
  }

  public get<K extends keyof DatabaseState>(table: K): DatabaseState[K] {
    return this.data[table];
  }

  public setTable<K extends keyof DatabaseState>(table: K, items: DatabaseState[K]) {
    this.data[table] = items;
    this.save();
  }

  public insert<K extends keyof DatabaseState>(table: K, item: any): any {
    (this.data[table] as any[]).push(item);
    this.save();
    return item;
  }

  public update<K extends keyof DatabaseState>(
    table: K,
    id: string,
    patch: Partial<any>
  ): any | null {
    const arr = this.data[table] as any[];
    const idx = arr.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...patch };
    this.save();
    return arr[idx];
  }

  public delete<K extends keyof DatabaseState>(table: K, id: string): boolean {
    const arr = this.data[table] as any[];
    const idx = arr.findIndex((x) => x.id === id);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    this.save();
    return true;
  }

  public logAudit(userId: string, action: string, entity: string, entityId: string) {
    const log: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      timestamp: new Date().toISOString()
    };
    this.insert('audit_log', log);
  }

  public isSeeded(): boolean {
    return this.data.users.length > 0 && this.data.trainees.length > 0;
  }

  public reset(newState: DatabaseState) {
    this.data = newState;
    this.save();
  }
}

export const db = new Database();
