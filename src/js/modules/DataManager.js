import { StorageUtils } from '../utils/storageUtils.js';
import { DateUtils } from '../utils/dateUtils.js';
import { STORAGE_KEYS } from '../utils/constants.js';

export class DataManager {
  constructor() {
    this.entries = this.loadEntries();
  }

  loadEntries() {
    return StorageUtils.get(STORAGE_KEYS.ENTRIES, []);
  }

  saveEntries() {
    return StorageUtils.set(STORAGE_KEYS.ENTRIES, this.entries);
  }

  addEntry(entry) {
    const newEntry = {
      id: Date.now(),
      ...entry,
      createdAt: new Date().toISOString()
    };
    
    this.entries.push(newEntry);
    this.saveEntries();
    return newEntry;
  }

  updateEntry(id, updates) {
    const index = this.entries.findIndex(entry => entry.id === id);
    if (index === -1) return false;

    this.entries[index] = { ...this.entries[index], ...updates };
    this.saveEntries();
    return this.entries[index];
  }

  deleteEntry(id) {
    const index = this.entries.findIndex(entry => entry.id === id);
    if (index === -1) return false;

    this.entries.splice(index, 1);
    this.saveEntries();
    return true;
  }

  getEntriesByDate(date) {
    return this.entries.filter(entry => entry.date === date);
  }

  getTodayEntries() {
    return this.getEntriesByDate(DateUtils.getCurrentDate());
  }

  getAllEntries() {
    return [...this.entries];
  }

  clearAllData() {
    this.entries = [];
    return this.saveEntries();
  }
}
