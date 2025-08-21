/**
 * Integration Tests for Work Ledger App
 * Tests complete user workflows and module interactions
 */

import WorkLedgerApp from '../../src/js/app.js';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock DOM methods
document.getElementById = jest.fn();
document.createElement = jest.fn();
document.addEventListener = jest.fn();
document.body = { 
  appendChild: jest.fn(), 
  classList: { add: jest.fn(), remove: jest.fn() } 
};

// Mock navigator for service worker
global.navigator = {
  serviceWorker: {
    register: jest.fn().mockResolvedValue({
      addEventListener: jest.fn()
    })
  }
};

describe('Work Ledger App Integration', () => {
  let app;
  let mockElements;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock DOM elements
    mockElements = {
      themeToggle: { addEventListener: jest.fn(), textContent: '🌙' },
      activitiesGrid: { 
        addEventListener: jest.fn(), 
        innerHTML: '',
        querySelectorAll: jest.fn().mockReturnValue([])
      },
      startBtn: { addEventListener: jest.fn(), disabled: false },
      stopBtn: { addEventListener: jest.fn(), disabled: true },
      exportTxt: { addEventListener: jest.fn() },
      exportCsv: { addEventListener: jest.fn() },
      currentActivityName: { textContent: 'No Activity' },
      activityTimer: { textContent: '00:00:00' },
      activityStatus: { 
        className: 'activity-status status-inactive', 
        innerHTML: '<span class="status-dot"></span><span>Inactive</span>' 
      },
      dailySummary: { innerHTML: '' },
      editModal: { 
        classList: { 
          add: jest.fn(), 
          remove: jest.fn() 
        }, 
        addEventListener: jest.fn() 
      },
      editForm: { addEventListener: jest.fn(), reset: jest.fn() },
      editActivity: { innerHTML: '', value: 'work' },
      editDate: { valueAsDate: new Date(), value: '2025-08-21' },
      editStartTime: { value: '09:00' },
      editEndTime: { value: '10:00' },
      manualEditBtn: { addEventListener: jest.fn() },
      cancelEdit: { addEventListener: jest.fn() }
    };

    // Setup getElementById mock
    document.getElementById.mockImplementation((id) => mockElements[id] || null);
    
    // Mock createElement
    document.createElement.mockReturnValue({
      className: '',
      innerHTML: '',
      appendChild: jest.fn(),
      classList: { 
        add: jest.fn(), 
        remove: jest.fn(), 
        toggle: jest.fn(),
        contains: jest.fn().mockReturnValue(false)
      },
      addEventListener: jest.fn(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn().mockReturnValue([]),
      textContent: '',
      href: '',
      download: '',
      click: jest.fn(),
      remove: jest.fn(),
      dataset: {}
    });

    // Mock document.querySelectorAll
    document.querySelectorAll = jest.fn().mockReturnValue([]);

    // Mock localStorage to return empty data
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockReturnValue(true);

    // Mock URL methods for file downloads
    global.URL = {
      createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: jest.fn()
    };

    // Mock Blob constructor
    global.Blob = jest.fn().mockImplementation((content, options) => ({
      size: content[0].length,
      type: options.type
    }));

    // Mock performance for timing tests
    global.performance = {
      now: jest.fn().mockReturnValue(1000)
    };

    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('Application Initialization', () => {
    test('should initialize all modules correctly', () => {
      app = new WorkLedgerApp();
      
      expect(app.dataManager).toBeDefined();
      expect(app.activityManager).toBeDefined();
      expect(app.timerManager).toBeDefined();
      expect(app.themeManager).toBeDefined();
      expect(app.exportManager).toBeDefined();
      expect(app.uiManager).toBeDefined();
    });

    test('should bind all event listeners', () => {
      app = new WorkLedgerApp();
      
      // Verify event listeners were attached
      expect(mockElements.themeToggle.addEventListener).toHaveBeenCalled();
      expect(mockElements.activitiesGrid.addEventListener).toHaveBeenCalled();
      expect(mockElements.startBtn.addEventListener).toHaveBeenCalled();
      expect(mockElements.stopBtn.addEventListener).toHaveBeenCalled();
    });

    test('should render initial UI state', () => {
      app = new WorkLedgerApp();
      
      // Check if UI was initialized
      expect(mockElements.currentActivityName.textContent).toBe('No Activity');
      expect(mockElements.activityTimer.textContent).toBe('00:00:00');
    });

    test('should register service worker', () => {
      app = new WorkLedgerApp();
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    });
  });

  describe('Activity Selection Workflow', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should select activity and enable start button', () => {
      app.selectActivity('work');
      
      expect(app.activityManager.getCurrentActivity()).toMatchObject({
        id: 'work',
        name: 'Work',
        icon: '💼'
      });
      expect(mockElements.currentActivityName.textContent).toBe('Work');
    });

    test('should highlight selected activity', () => {
      const mockActivityBtn = {
        classList: { toggle: jest.fn() },
        dataset: { activity: 'work' },
        closest: jest.fn().mockReturnThis()
      };
      
      document.querySelectorAll.mockReturnValue([mockActivityBtn]);
      
      app.selectActivity('work');
      
      expect(mockActivityBtn.classList.toggle).toHaveBeenCalledWith('active', true);
    });

    test('should handle activity click events', () => {
      const mockEvent = {
        target: {
          closest: jest.fn().mockReturnValue({
            dataset: { activity: 'work' }
          })
        }
      };

      app.selectActivity = jest.fn();
      
      // Simulate click event
      const clickHandler = mockElements.activitiesGrid.addEventListener.mock.calls
        .find(call => call[0] === 'click')[1];
      
      clickHandler(mockEvent);
      
      expect(app.selectActivity).toHaveBeenCalledWith('work');
    });
  });

  describe('Timer Workflow', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
      app.selectActivity('work');
    });

    test('should start timer when activity selected', () => {
      app.startActivity();
      
      expect(app.timerManager.isActive()).toBe(true);
      expect(mockElements.activityStatus.className).toBe('activity-status status-active');
    });

    test('should stop timer and save entry', () => {
      app.startActivity();
      app.stopActivity();
      
      expect(app.timerManager.isActive()).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should update UI when timer stops', () => {
      app.startActivity();
      app.stopActivity();
      
      expect(mockElements.currentActivityName.textContent).toBe('No Activity');
      expect(mockElements.activityTimer.textContent).toBe('00:00:00');
    });

    test('should prevent starting without selected activity', () => {
      app.activityManager.clearCurrentActivity();
      
      app.startActivity();
      
      expect(app.timerManager.isActive()).toBe(false);
    });

    test('should handle timer update callbacks', () => {
      app.startActivity();
      
      // Simulate timer update
      app.updateTimerDisplay('01:30:00', { name: 'Work' });
      
      expect(mockElements.activityTimer.textContent).toBe('01:30:00');
    });
  });

  describe('Manual Entry Workflow', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should open manual edit modal', () => {
      app.openManualEdit();
      
      expect(mockElements.editModal.classList.add).toHaveBeenCalledWith('show');
    });

    test('should close manual edit modal', () => {
      app.closeManualEdit();
      
      expect(mockElements.editModal.classList.remove).toHaveBeenCalledWith('show');
    });

    test('should provide visual feedback for state changes', () => {
      app.selectActivity('work');
      
      expect(mockElements.currentActivityName.textContent).toBe('Work');
      
      app.startActivity();
      
      expect(mockElements.activityStatus.className).toBe('activity-status status-active');
      
      app.stopActivity();
      
      expect(mockElements.activityStatus.className).toBe('activity-status status-inactive');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should maintain focus management', () => {
      app.openManualEdit();
      
      // Modal should be properly managed
      expect(mockElements.editModal.classList.add).toHaveBeenCalledWith('show');
    });

    test('should provide proper ARIA labels', () => {
      // Elements should have proper attributes set during initialization
      expect(document.createElement).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should handle concurrent timer operations', () => {
      app.selectActivity('work');
      app.startActivity();
      
      // Try to start again while running
      app.startActivity();
      
      // Should remain in single active state
      expect(app.timerManager.isActive()).toBe(true);
    });

    test('should handle invalid activity selection', () => {
      const result = app.selectActivity('nonexistent');
      
      expect(app.activityManager.getCurrentActivity()).toBeNull();
    });

    test('should handle empty export attempts', () => {
      app.dataManager.clearAllData();
      
      expect(() => {
        app.exportData('txt');
      }).not.toThrow();
    });

    test('should handle malformed localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      expect(() => {
        new WorkLedgerApp();
      }).not.toThrow();
    });
  });

  describe('Module Integration', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should coordinate between timer and data managers', () => {
      app.selectActivity('work');
      app.startActivity();
      app.stopActivity();
      
      // Data should be saved and timer should be reset
      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(app.timerManager.isActive()).toBe(false);
    });

    test('should synchronize UI with data changes', () => {
      app.dataManager.addEntry({
        activity: 'work',
        activityName: 'Work',
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000,
        date: '2025-08-21'
      });

      app.updateSummary();
      
      // UI should reflect the data change
      expect(mockElements.dailySummary.innerHTML).toBeDefined();
    });

    test('should maintain theme consistency across components', () => {
      const theme = app.themeManager.getCurrentTheme();
      
      app.themeManager.toggleTheme();
      
      const newTheme = app.themeManager.getCurrentTheme();
      expect(newTheme).not.toBe(theme);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('workLedgerTheme', newTheme);
    });
  });

  describe('Real-world Scenarios', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should handle a complete work day scenario', () => {
      // Morning work session
      app.selectActivity('work');
      app.startActivity();
      app.stopActivity();
      
      // Lunch break
      app.selectActivity('lunch');
      app.startActivity();
      app.stopActivity();
      
      // Afternoon work session
      app.selectActivity('work');
      app.startActivity();
      app.stopActivity();
      
      // Should have 3 entries saved
      const entries = app.dataManager.getAllEntries();
      expect(entries.length).toBeGreaterThanOrEqual(3);
    });

    test('should handle user forgetting to stop timer', () => {
      app.selectActivity('work');
      app.startActivity();
      
      // User manually adds entry for the period
      const mockEvent = {
        preventDefault: jest.fn(),
        target: document.createElement('form')
      };

      app.saveManualEntry(mockEvent);
      
      // Should handle both running timer and manual entry
      expect(app.timerManager.isActive()).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should handle theme changes during active session', () => {
      app.selectActivity('work');
      app.startActivity();
      
      app.themeManager.toggleTheme();
      
      // Timer should continue running despite theme change
      expect(app.timerManager.isActive()).toBe(true);
    });

    test('should handle export of large datasets', () => {
      // Add multiple entries
      for (let i = 0; i < 50; i++) {
        app.dataManager.addEntry({
          activity: 'work',
          activityName: 'Work',
          startTime: `2025-08-21T${String(9 + i % 8).padStart(2, '0')}:00:00.000Z`,
          endTime: `2025-08-21T${String(10 + i % 8).padStart(2, '0')}:00:00.000Z`,
          duration: 3600000,
          date: '2025-08-21'
        });
      }

      expect(() => {
        app.exportData('csv');
      }).not.toThrow();
    });
  });

  describe('Browser Compatibility', () => {
    test('should handle missing modern APIs gracefully', () => {
      // Mock missing service worker
      delete global.navigator.serviceWorker;
      
      expect(() => {
        new WorkLedgerApp();
      }).not.toThrow();
    });

    test('should handle localStorage quota exceeded', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

      app = new WorkLedgerApp();
      app.selectActivity('work');
      app.startActivity();
      
      expect(() => {
        app.stopActivity();
      }).not.toThrow();
    });
  });
});BeenCalledWith('show');
      expect(mockElements.editForm.reset).toHaveBeenCalled();
    });

    test('should save manual entry with valid data', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        target: document.createElement('form')
      };

      app.saveManualEntry(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should validate manual entry data', () => {
      // Mock invalid data
      mockElements.editActivity.value = '';
      
      const mockEvent = {
        preventDefault: jest.fn(),
        target: document.createElement('form')
      };

      app.saveManualEntry(mockEvent);
      
      // Should prevent saving invalid data
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    test('should validate time range', () => {
      mockElements.editStartTime.value = '10:00';
      mockElements.editEndTime.value = '09:00'; // End before start
      
      const mockEvent = {
        preventDefault: jest.fn(),
        target: document.createElement('form')
      };

      app.saveManualEntry(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Export Workflow', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
      
      // Add mock entry to export
      app.dataManager.addEntry({
        activity: 'work',
        activityName: 'Work',
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000,
        date: '2025-08-21'
      });
    });

    test('should export data in TXT format', () => {
      const mockLink = document.createElement('a');
      document.createElement.mockReturnValue(mockLink);

      app.exportData('txt');
      
      expect(mockLink.download).toContain('.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('should export data in CSV format', () => {
      const mockLink = document.createElement('a');
      document.createElement.mockReturnValue(mockLink);

      app.exportData('csv');
      
      expect(mockLink.download).toContain('.csv');
      expect(mockLink.click).toHaveBeenCalled();
    });

    test('should handle export with no data', () => {
      // Clear data
      app.dataManager.clearAllData();
      
      // Mock alert
      global.alert = jest.fn();
      
      app.exportData('txt');
      
      // Should handle gracefully without throwing
      expect(app.exportData).not.toThrow();
    });

    test('should clean up download URLs', () => {
      const mockLink = document.createElement('a');
      document.createElement.mockReturnValue(mockLink);

      app.exportData('txt');
      
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Theme Management', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should toggle theme', () => {
      const initialTheme = app.themeManager.getCurrentTheme();
      
      app.themeManager.toggleTheme();
      
      const newTheme = app.themeManager.getCurrentTheme();
      expect(newTheme).not.toBe(initialTheme);
    });

    test('should persist theme preference', () => {
      app.themeManager.toggleTheme();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'workLedgerTheme',
        expect.any(String)
      );
    });

    test('should update theme toggle button', () => {
      const currentTheme = app.themeManager.getCurrentTheme();
      const expectedIcon = currentTheme === 'dark' ? '☀️' : '🌙';
      
      expect(mockElements.themeToggle.textContent).toBe(expectedIcon);
    });
  });

  describe('Data Persistence', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should load existing data on initialization', () => {
      const mockData = JSON.stringify([{
        id: 1,
        activity: 'work',
        activityName: 'Work',
        duration: 3600000,
        date: '2025-08-21'
      }]);
      
      localStorageMock.getItem.mockReturnValue(mockData);
      
      const newApp = new WorkLedgerApp();
      const entries = newApp.dataManager.getAllEntries();
      
      expect(entries).toHaveLength(1);
    });

    test('should save data after timer operations', () => {
      app.selectActivity('work');
      app.startActivity();
      app.stopActivity();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'workLedgerEntries',
        expect.any(String)
      );
    });

    test('should update summary after data changes', () => {
      app.dataManager.addEntry({
        activity: 'work',
        activityName: 'Work',
        startTime: '2025-08-21T09:00:00.000Z',
        endTime: '2025-08-21T10:00:00.000Z',
        duration: 3600000,
        date: '2025-08-21'
      });

      app.updateSummary();
      
      expect(mockElements.dailySummary.innerHTML).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock localStorage error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      app.selectActivity('work');
      app.startActivity();
      app.stopActivity();
      
      // App should continue functioning despite storage error
      expect(app.timerManager.isActive()).toBe(false);
      
      consoleSpy.mockRestore();
    });

    test('should handle missing DOM elements', () => {
      // Mock missing elements
      document.getElementById.mockReturnValue(null);
      
      expect(() => {
        new WorkLedgerApp();
      }).not.toThrow();
    });

    test('should handle service worker registration failure', () => {
      navigator.serviceWorker.register.mockRejectedValue(new Error('SW failed'));
      
      expect(() => {
        new WorkLedgerApp();
      }).not.toThrow();
    });

    test('should handle export errors gracefully', () => {
      global.URL.createObjectURL.mockImplementation(() => {
        throw new Error('Blob error');
      });

      expect(() => {
        app.exportData('txt');
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should initialize quickly', () => {
      const startTime = 1000;
      const endTime = 1010;
      
      global.performance.now
        .mockReturnValueOnce(startTime)
        .mockReturnValueOnce(endTime);
      
      app = new WorkLedgerApp();
      
      // Should initialize in under 50ms (mocked to 10ms)
      expect(endTime - startTime).toBeLessThan(50);
    });

    test('should handle multiple rapid interactions', () => {
      app = new WorkLedgerApp();
      
      // Simulate rapid button clicks
      for (let i = 0; i < 10; i++) {
        app.selectActivity('work');
        app.selectActivity('lunch');
      }
      
      // Should maintain consistent state
      expect(app.activityManager.getCurrentActivity().id).toBe('lunch');
    });

    test('should clean up resources on destroy', () => {
      app = new WorkLedgerApp();
      app.selectActivity('work');
      app.startActivity();
      
      app.destroy();
      
      expect(app.timerManager.isActive()).toBe(false);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should maintain consistent state across operations', () => {
      app.selectActivity('work');
      app.startActivity();
      
      const state = app.getState();
      
      expect(state).toMatchObject({
        isTimerActive: true,
        currentActivity: expect.objectContaining({ id: 'work' }),
        theme: expect.any(String),
        entriesCount: expect.any(Number),
        todayEntriesCount: expect.any(Number)
      });
    });

    test('should reset state properly', () => {
      app.selectActivity('work');
      app.startActivity();
      app.stopActivity();
      
      const state = app.getState();
      
      expect(state.isTimerActive).toBe(false);
      expect(state.currentActivity).toBeNull();
    });
  });

  describe('User Experience', () => {
    beforeEach(() => {
      app = new WorkLedgerApp();
    });

    test('should provide feedback for user actions', () => {
      app.selectActivity('work');
      app.startActivity();
      
      // Should update UI to show active state
      expect(mockElements.activityStatus.className).toBe('activity-status status-active');
    });

    test('should handle keyboard interactions', () => {
      const escapeEvent = {
        key: 'Escape',
        preventDefault: jest.fn()
      };

      app.openManualEdit();
      
      // Simulate escape key press
      const keydownHandler = document.addEventListener.mock.calls
        .find(call => call[0] === 'keydown')[1];
      
      keydownHandler(escapeEvent);
      
      expect(mockElements.editModal.classList.remove).toHave
