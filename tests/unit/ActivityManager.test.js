/**
 * Activity Manager Unit Tests
 * Tests for activity selection and management functionality
 */

import { ActivityManager } from '../../src/js/modules/ActivityManager.js';
import { DataManager } from '../../src/js/modules/DataManager.js';

describe('ActivityManager', () => {
  let activityManager;
  let mockDataManager;

  beforeEach(() => {
    // Mock DataManager
    mockDataManager = {
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      getEntriesByDate: jest.fn().mockReturnValue([]),
      getTodayEntries: jest.fn().mockReturnValue([])
    };

    activityManager = new ActivityManager(mockDataManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with default activities', () => {
      const activities = activityManager.getActivities();
      expect(activities).toHaveLength(6);
      expect(activities[0]).toEqual({
        id: 'work',
        name: 'Work',
        icon: '💼'
      });
    });

    test('should set currentActivity to null initially', () => {
      expect(activityManager.getCurrentActivity()).toBeNull();
    });
  });

  describe('getActivities', () => {
    test('should return all activities', () => {
      const activities = activityManager.getActivities();
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThan(0);
    });

    test('should include all default activities', () => {
      const activities = activityManager.getActivities();
      const activityIds = activities.map(a => a.id);
      
      expect(activityIds).toContain('work');
      expect(activityIds).toContain('lunch');
      expect(activityIds).toContain('tea');
      expect(activityIds).toContain('dinner');
      expect(activityIds).toContain('break');
      expect(activityIds).toContain('sleep');
    });
  });

  describe('getActivity', () => {
    test('should return activity by id', () => {
      const activity = activityManager.getActivity('work');
      expect(activity).toEqual({
        id: 'work',
        name: 'Work',
        icon: '💼'
      });
    });

    test('should return undefined for non-existent activity', () => {
      const activity = activityManager.getActivity('nonexistent');
      expect(activity).toBeUndefined();
    });
  });

  describe('selectActivity', () => {
    test('should select valid activity', () => {
      const result = activityManager.selectActivity('work');
      expect(result).toBe(true);
      expect(activityManager.getCurrentActivity()).toEqual({
        id: 'work',
        name: 'Work',
        icon: '💼'
      });
    });

    test('should return false for invalid activity', () => {
      const result = activityManager.selectActivity('invalid');
      expect(result).toBe(false);
      expect(activityManager.getCurrentActivity()).toBeNull();
    });

    test('should update current activity when selecting different activity', () => {
      activityManager.selectActivity('work');
      activityManager.selectActivity('lunch');
      
      expect(activityManager.getCurrentActivity()).toEqual({
        id: 'lunch',
        name: 'Lunch',
        icon: '🍽️'
      });
    });
  });

  describe('clearCurrentActivity', () => {
    test('should clear selected activity', () => {
      activityManager.selectActivity('work');
      expect(activityManager.getCurrentActivity()).not.toBeNull();
      
      activityManager.clearCurrentActivity();
      expect(activityManager.getCurrentActivity()).toBeNull();
    });
  });

  describe('addCustomActivity', () => {
    test('should add custom activity with generated id', () => {
      const customActivity = {
        name: 'Custom Task',
        icon: '⚡'
      };

      const result = activityManager.addCustomActivity(customActivity);
      
      expect(result).toMatchObject({
        name: 'Custom Task',
        icon: '⚡',
        isCustom: true
      });
      expect(result.id).toMatch(/^custom_\d+$/);
      
      const activities = activityManager.getActivities();
      expect(activities).toContainEqual(result);
    });

    test('should mark custom activities as custom', () => {
      const result = activityManager.addCustomActivity({
        name: 'Test',
        icon: '🧪'
      });
      
      expect(result.isCustom).toBe(true);
    });
  });

  describe('removeCustomActivity', () => {
    test('should remove custom activity', () => {
      const customActivity = activityManager.addCustomActivity({
        name: 'Test',
        icon: '🧪'
      });
      
      const result = activityManager.removeCustomActivity(customActivity.id);
      expect(result).toBe(true);
      
      const activities = activityManager.getActivities();
      expect(activities).not.toContainEqual(customActivity);
    });

    test('should not remove default activities', () => {
      const result = activityManager.removeCustomActivity('work');
      expect(result).toBe(false);
      
      const activities = activityManager.getActivities();
      expect(activities.find(a => a.id === 'work')).toBeDefined();
    });

    test('should return false for non-existent activity', () => {
      const result = activityManager.removeCustomActivity('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('renderActivities', () => {
    test('should render activities to container', () => {
      const container = document.createElement('div');
      activityManager.renderActivities(container);
      
      const buttons = container.querySelectorAll('.activity-btn');
      expect(buttons.length).toBe(6); // Default activities
      
      const workButton = container.querySelector('[data-activity="work"]');
      expect(workButton).toBeTruthy();
      expect(workButton.textContent).toContain('Work');
    });

    test('should handle null container gracefully', () => {
      expect(() => {
        activityManager.renderActivities(null);
      }).not.toThrow();
    });

    test('should include custom activities in render', () => {
      const container = document.createElement('div');
      
      activityManager.addCustomActivity({
        name: 'Custom',
        icon: '⚡'
      });
      
      activityManager.renderActivities(container);
      
      const buttons = container.querySelectorAll('.activity-btn');
      expect(buttons.length).toBe(7); // 6 default + 1 custom
    });
  });
});
