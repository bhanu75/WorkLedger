/**
 * Timer Manager Unit Tests
 * Tests for timer functionality and time tracking
 */

import { TimerManager } from '../../src/js/modules/TimerManager.js';
import { DateUtils } from '../../src/js/utils/dateUtils.js';

// Mock DateUtils
jest.mock('../../src/js/utils/dateUtils.js');

describe('TimerManager', () => {
  let timerManager;
  let mockDataManager;
  let mockUpdateCallback;

  beforeEach(() => {
    // Mock DataManager
    mockDataManager = {
      addEntry: jest.fn().mockReturnValue({ id: 123, activity: 'work' })
    };

    // Mock update callback
    mockUpdateCallback = jest.fn();

    // Mock DateUtils
    DateUtils.formatDuration.mockReturnValue('01:30:00');
    DateUtils.formatDate.mockReturnValue('2025-08-21');

    timerManager = new TimerManager(mockDataManager, mockUpdateCallback);

    // Mock Date constructor for consistent testing
    jest.spyOn(global, 'Date').mockImplementation(() => ({
      getTime: () => 1692603600000,
      toISOString: () => '2025-08-21T09:00:00.000Z'
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with inactive state', () => {
      expect(timerManager.isActive()).toBe(false);
      expect(timerManager.getCurrentActivity()).toBeNull();
      expect(timerManager.getCurrentDuration()).toBe(0);
    });
  });

  describe('start', () => {
    const testActivity = { id: 'work', name: 'Work', icon: '💼' };

    test('should start timer with activity', () => {
      const result = timerManager.start(testActivity);

      expect(result).toBe(true);
      expect(timerManager.isActive()).toBe(true);
      expect(timerManager.getCurrentActivity()).toEqual(testActivity);
    });

    test('should not start if already running', () => {
      timerManager.start(testActivity);
      const result = timerManager.start(testActivity);

      expect(result).toBe(false);
    });

    test('should call update callback periodically', (done) => {
      timerManager.start(testActivity);

      // Wait for interval to trigger
      setTimeout(() => {
        expect(mockUpdateCallback).toHaveBeenCalled();
        done();
      }, 1100);
    });
  });

  describe('stop', () => {
    const testActivity = { id: 'work', name: 'Work', icon: '💼' };

    test('should stop timer and return entry', () => {
      timerManager.start(testActivity);
      const result = timerManager.stop();

      expect(result).toEqual({ id: 123, activity: 'work' });
      expect(timerManager.isActive()).toBe(false);
      expect(mockDataManager.addEntry).toHaveBeenCalled();
    });

    test('should return null if not running', () => {
      const result = timerManager.stop();
      expect(result).toBeNull();
    });

    test('should calculate duration correctly', () => {
      const startTime = new Date('2025-08-21T09:00:00.000Z');
      const endTime = new Date('2025-08-21T10:30:00.000Z');
      
      // Mock different times for start and stop
      global.Date = jest.fn()
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(endTime);

      timerManager.start(testActivity);
      timerManager.stop();

      expect(mockDataManager.addEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: expect.any(Number)
        })
      );
    });

    test('should reset state after stopping', () => {
      timerManager.start(testActivity);
      timerManager.stop();

      expect(timerManager.getCurrentActivity()).toBeNull();
      expect(timerManager.getCurrentDuration()).toBe(0);
    });
  });

  describe('reset', () => {
    const testActivity = { id: 'work', name: 'Work', icon: '💼' };

    test('should reset timer state', () => {
      timerManager.start(testActivity);
      timerManager.reset();

      expect(timerManager.isActive()).toBe(false);
      expect(timerManager.getCurrentActivity()).toBeNull();
      expect(timerManager.getCurrentDuration()).toBe(0);
    });

    test('should clear timer interval', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      timerManager.start(testActivity);
      timerManager.reset();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('getCurrentDuration', () => {
    const testActivity = { id: 'work', name: 'Work', icon: '💼' };

    test('should return 0 when not started', () => {
      expect(timerManager.getCurrentDuration()).toBe(0);
    });

    test('should return elapsed time when running', () => {
      const startTime = 1692603600000;
      const currentTime = 1692607200000; // 1 hour later
      
      global.Date = jest.fn()
        .mockReturnValueOnce({ getTime: () => startTime })
        .mockReturnValue({ getTime: () => currentTime });

      timerManager.start(testActivity);
      
      expect(timerManager.getCurrentDuration()).toBe(3600000); // 1 hour in ms
    });
  });

  describe('updateTimer', () => {
    const testActivity = { id: 'work', name: 'Work', icon: '💼' };

    test('should call update callback with formatted time', () => {
      timerManager.start(testActivity);
      
      // Manually trigger update
      timerManager.updateTimer();

      expect(mockUpdateCallback).toHaveBeenCalledWith('01:30:00', testActivity);
      expect(DateUtils.formatDuration).toHaveBeenCalled();
    });

    test('should not call callback if no start time', () => {
      timerManager.updateTimer();
      expect(mockUpdateCallback).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing callback gracefully', () => {
      const timerWithoutCallback = new TimerManager(mockDataManager, null);
      const testActivity = { id: 'work', name: 'Work', icon: '💼' };

      expect(() => {
        timerWithoutCallback.start(testActivity);
        timerWithoutCallback.updateTimer();
      }).not.toThrow();
    });

    test('should handle data manager errors', () => {
      mockDataManager.addEntry.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const testActivity = { id: 'work', name: 'Work', icon: '💼' };
      timerManager.start(testActivity);

      expect(() => {
        timerManager.stop();
      }).not.toThrow();
    });
  });

  describe('Timer Precision', () => {
    const testActivity = { id: 'work', name: 'Work', icon: '💼' };

    test('should handle rapid start/stop operations', () => {
      for (let i = 0; i < 5; i++) {
        timerManager.start(testActivity);
        timerManager.stop();
      }

      expect(mockDataManager.addEntry).toHaveBeenCalledTimes(5);
    });

    test('should maintain accuracy over longer periods', () => {
      const startTime = 1692603600000; // Fixed start time
      const endTime = startTime + (8 * 60 * 60 * 1000); // 8 hours later
      
      global.Date = jest.fn()
        .mockReturnValueOnce({ getTime: () => startTime, toISOString: () => '2025-08-21T09:00:00.000Z' })
        .mockReturnValueOnce({ getTime: () => endTime, toISOString: () => '2025-08-21T17:00:00.000Z' });

      timerManager.start(testActivity);
      timerManager.stop();

      expect(mockDataManager.addEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
        })
      );
    });
  });

  describe('Memory Management', () => {
    const testActivity = { id: 'work', name: 'Work', icon: '💼' };

    test('should clear intervals on reset', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      timerManager.start(testActivity);
      expect(timerManager.timerInterval).toBeDefined();
      
      timerManager.reset();
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(timerManager.timerInterval).toBeNull();
    });

    test('should clear intervals on stop', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      timerManager.start(testActivity);
      timerManager.stop();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('State Consistency', () => {
    const testActivity = { id: 'work', name: 'Work', icon: '💼' };

    test('should maintain consistent state during operations', () => {
      // Initial state
      expect(timerManager.isActive()).toBe(false);
      expect(timerManager.getCurrentActivity()).toBeNull();
      
      // After start
      timerManager.start(testActivity);
      expect(timerManager.isActive()).toBe(true);
      expect(timerManager.getCurrentActivity()).toEqual(testActivity);
      
      // After stop
      timerManager.stop();
      expect(timerManager.isActive()).toBe(false);
      expect(timerManager.getCurrentActivity()).toBeNull();
    });

    test('should handle multiple activities correctly', () => {
      const activity1 = { id: 'work', name: 'Work', icon: '💼' };
      const activity2 = { id: 'lunch', name: 'Lunch', icon: '🍽️' };
      
      timerManager.start(activity1);
      expect(timerManager.getCurrentActivity()).toEqual(activity1);
      
      timerManager.stop();
      timerManager.start(activity2);
      expect(timerManager.getCurrentActivity()).toEqual(activity2);
    });
  });
});
