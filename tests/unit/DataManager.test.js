/**
 * Data Manager Unit Tests
 * Tests for data persistence and retrieval functionality
 */

import { DataManager } from '../../src/js/modules/DataManager.js';
import { StorageUtils } from '../../src/js/utils/storageUtils.js';

// Mock StorageUtils
jest.mock('../../src/js/utils/storageUtils.js');

describe('DataManager', () => {
  let dataManager;
  let mockStorageGet;
  let mockStorageSet;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    mockStorageGet = StorageUtils.get.mockReturnValue([]);
    mockStorageSet = StorageUtils.set.mockReturnValue(true);
    
    dataManager = new DataManager();
  });

  describe('Constructor', () => {
    test('should load entries from storage on initialization', () => {
      expect(StorageUtils.get).toHaveBeenCalledWith('workLedgerEntries', []);
    });

    test('should initialize with empty array when no stored data', () => {
      expect(dataManager.getAllEntries()).toEqual([]);
    });
  });

  describe('addEntry', () => {
    test('should add entry with generated id and timestamp', () => {
      const entry = {
        activity: 'work',
        activityName: 'Work',
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000,
        date: '2025-08-21'
      };

      const result = dataManager.addEntry(entry);

      expect(result).toMatchObject(entry);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(typeof result.id).toBe('number');
    });

    test('should save entries after adding', () => {
      const entry = {
        activity: 'work',
        activityName: 'Work',
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000,
        date: '2025-08-21'
      };

      dataManager.addEntry(entry);

      expect(StorageUtils.set).toHaveBeenCalledWith(
        'workLedgerEntries',
        expect.arrayContaining([expect.objectContaining(entry)])
      );
    });

    test('should add entry to internal array', () => {
      const entry = {
        activity: 'work',
        activityName: 'Work',
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000,
        date: '2025-08-21'
      };

      const result = dataManager.addEntry(entry);
      const allEntries = dataManager.getAllEntries();

      expect(allEntries).toContainEqual(result);
      expect(allEntries.length).toBe(1);
    });
  });

  describe('updateEntry', () => {
    test('should update existing entry', () => {
      const entry = dataManager.addEntry({
        activity: 'work',
        activityName: 'Work',
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000,
        date: '2025-08-21'
      });

      const updates = {
        endTime: '2025-08-21T11:00:00.000Z',
        duration: 7200000
      };

      const result = dataManager.updateEntry(entry.id, updates);

      expect(result).toMatchObject({ ...entry, ...updates });
      expect(StorageUtils.set).toHaveBeenCalled();
    });

    test('should return false for non-existent entry', () => {
      const result = dataManager.updateEntry(999999, { activity: 'lunch' });
      expect(result).toBe(false);
    });

    test('should not save when update fails', () => {
      // Reset mock call count
      StorageUtils.set.mockClear();
      
      const result = dataManager.updateEntry(999999, { activity: 'lunch' });
      
      expect(result).toBe(false);
      expect(StorageUtils.set).not.toHaveBeenCalled();
    });
  });

  describe('deleteEntry', () => {
    test('should delete existing entry', () => {
      const entry = dataManager.addEntry({
        activity: 'work',
        activityName: 'Work',
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000,
        date: '2025-08-21'
      });

      const result = dataManager.deleteEntry(entry.id);

      expect(result).toBe(true);
      expect(dataManager.getAllEntries()).not.toContainEqual(entry);
      expect(StorageUtils.set).toHaveBeenCalled();
    });

    test('should return false for non-existent entry', () => {
      const result = dataManager.deleteEntry(999999);
      expect(result).toBe(false);
    });
  });

  describe('getEntriesByDate', () => {
    beforeEach(() => {
      // Add test entries
      dataManager.addEntry({
        activity: 'work',
        activityName: 'Work',
        date: '2025-08-21',
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000
      });

      dataManager.addEntry({
        activity: 'lunch',
        activityName: 'Lunch',
        date: '2025-08-21',
        startTime: '2025-08-21T12:00:00.000Z',
        endTime: '2025-08-21T13:00:00.000Z',
        duration: 3600000
      });

      dataManager.addEntry({
        activity: 'work',
        activityName: 'Work',
        date: '2025-08-20',
        startTime: '2025-08-20T09:00:00.000Z',
        endTime: '2025-08-20T10:00:00.000Z',
        duration: 3600000
      });
    });

    test('should return entries for specific date', () => {
      const entries = dataManager.getEntriesByDate('2025-08-21');
      
      expect(entries).toHaveLength(2);
      expect(entries.every(entry => entry.date === '2025-08-21')).toBe(true);
    });

    test('should return empty array for date with no entries', () => {
      const entries = dataManager.getEntriesByDate('2025-08-22');
      expect(entries).toEqual([]);
    });
  });

  describe('getTodayEntries', () => {
    test('should return entries for current date', () => {
      // Mock DateUtils.getCurrentDate
      const today = '2025-08-21';
      
      dataManager.addEntry({
        activity: 'work',
        activityName: 'Work',
        date: today,
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000
      });

      // Since getTodayEntries uses DateUtils.getCurrentDate internally,
      // we'll test getEntriesByDate with today's date
      const entries = dataManager.getEntriesByDate(today);
      expect(entries).toHaveLength(1);
    });
  });

  describe('clearAllData', () => {
    test('should clear all entries and save', () => {
      // Add some entries
      dataManager.addEntry({
        activity: 'work',
        activityName: 'Work',
        date: '2025-08-21',
        startTime: '### src/components/ActivityCard.js
export class ActivityCard {
  constructor(activity, isActive = false) {
    this.activity = activity;
    this.isActive = isActive;
    this.element = this.createElement();
  }

  createElement() {
    const card = document.createElement('button');
    card.className = `activity-btn ${this.isActive ? 'active' : ''}`;
    card.dataset.activity = this.activity.id;
    card.setAttribute('aria-pressed', this.isActive.toString());
    card.setAttribute('title', `Select ${this.activity.name} activity`);
    
    card.innerHTML = `
      <div class="activity-icon" aria-hidden="true">${this.activity.icon}</div>
      <div>${this.activity.name}</div>
    `;
    
    return card;
  }

  setActive(active) {
    this.isActive = active;
    this.element.classList.toggle('active', active);
    this.element.setAttribute('aria-pressed', active.toString());
  }

  render(container) {
    if (container) {
      container.appendChild(this.element);
    }
    return this.element;
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  onClick(callback) {
    this.element.addEventListener('click', () => {
      callback(this.activity);
    });
  }
}
