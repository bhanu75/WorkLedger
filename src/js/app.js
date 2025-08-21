import { DataManager } from './modules/DataManager.js';
import { ThemeManager } from './modules/ThemeManager.js';
import { ActivityManager } from './modules/ActivityManager.js';
import { TimerManager } from './modules/TimerManager.js';
import { ExportManager } from './modules/ExportManager.js';
import { UIManager } from './modules/UIManager.js';
import { DateUtils } from './utils/dateUtils.js';

/**
 * Main Application Class - Orchestrates all modules
 * Follows Single Responsibility and Dependency Injection principles
 */
class WorkLedgerApp {
  constructor() {
    this.initializeModules();
    this.bindEvents();
    this.initializeUI();
    this.registerServiceWorker();
  }

  /**
   * Initialize all application modules
   * Each module has a specific responsibility
   */
  initializeModules() {
    // Core data management
    this.dataManager = new DataManager();
    
    // Theme management
    this.themeManager = new ThemeManager();
    
    // Activity management
    this.activityManager = new ActivityManager(this.dataManager);
    
    // Timer with callback for UI updates
    this.timerManager = new TimerManager(
      this.dataManager,
      (timeString, activity) => this.updateTimerDisplay(timeString, activity)
    );
    
    // Export functionality
    this.exportManager = new ExportManager(this.dataManager);
    
    // UI management
    this.uiManager = new UIManager();
  }

  /**
   * Initialize the user interface
   */
  initializeUI() {
    // Render activities grid
    this.activityManager.renderActivities(
      document.getElementById('activitiesGrid')
    );
    
    // Populate edit form options
    this.uiManager.populateEditForm(this.activityManager.getActivities());
    
    // Update summary display
    this.updateSummary();
    
    // Set initial UI state
    this.uiManager.resetUI();
  }

  /**
   * Bind all event listeners
   */
  bindEvents() {
    this.bindThemeEvents();
    this.bindActivityEvents();
    this.bindControlEvents();
    this.bindExportEvents();
    this.bindModalEvents();
  }

  bindThemeEvents() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.themeManager.toggleTheme();
      });
    }
  }

  bindActivityEvents() {
    const activitiesGrid = document.getElementById('activitiesGrid');
    if (activitiesGrid) {
      activitiesGrid.addEventListener('click', (e) => {
        const activityBtn = e.target.closest('.activity-btn');
        if (activityBtn) {
          const activityId = activityBtn.dataset.activity;
          this.selectActivity(activityId);
        }
      });
    }
  }

  bindControlEvents() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.startActivity());
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopActivity());
    }
  }

  bindExportEvents() {
    const exportTxtBtn = document.getElementById('exportTxt');
    const exportCsvBtn = document.getElementById('exportCsv');

    if (exportTxtBtn) {
      exportTxtBtn.addEventListener('click', () => this.exportData('txt'));
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
    }
  }

  bindModalEvents() {
    const manualEditBtn = document.getElementById('manualEditBtn');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const editForm = document.getElementById('editForm');
    const editModal = document.getElementById('editModal');

    if (manualEditBtn) {
      manualEditBtn.addEventListener('click', () => this.openManualEdit());
    }

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => this.closeManualEdit());
    }

    if (editForm) {
      editForm.addEventListener('submit', (e) => this.saveManualEntry(e));
    }

    if (editModal) {
      editModal.addEventListener('click', (e) => {
        if (e.target === editModal) this.closeManualEdit();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeManualEdit();
    });
  }

  /**
   * Activity selection handler
   */
  selectActivity(activityId) {
    const success = this.activityManager.selectActivity(activityId);
    if (success) {
      const activity = this.activityManager.getCurrentActivity();
      this.uiManager.updateCurrentActivity(activity.name);
      this.uiManager.highlightActivity(activityId);
      
      // Enable start button
      const startBtn = document.getElementById('startBtn');
      if (startBtn) startBtn.disabled = false;
    }
  }

  /**
   * Start activity tracking
   */
  startActivity() {
    const currentActivity = this.activityManager.getCurrentActivity();
    if (!currentActivity) {
      this.uiManager.showNotification('Please select an activity first', 'warning');
      return;
    }

    const success = this.timerManager.start(currentActivity);
    if (success) {
      this.uiManager.updateStatus(true);
      this.uiManager.updateControlButtons(true);
      this.uiManager.showNotification(`Started tracking ${currentActivity.name}`, 'success');
    }
  }

  /**
   * Stop activity tracking
   */
  stopActivity() {
    const entry = this.timerManager.stop();
    if (entry) {
      this.uiManager.updateStatus(false);
      this.uiManager.updateControlButtons(false);
      this.uiManager.resetUI();
      this.updateSummary();
      this.uiManager.showNotification(`Stopped tracking ${entry.activityName}`, 'success');
    }
  }

  /**
   * Update timer display callback
   */
  updateTimerDisplay(timeString, activity) {
    this.uiManager.updateTimer(timeString);
  }

  /**
   * Update daily summary
   */
  updateSummary() {
    const todayEntries = this.dataManager.getTodayEntries();
    const activities = this.activityManager.getActivities();
    this.uiManager.updateSummary(todayEntries, activities);
  }

  /**
   * Export data handler
   */
  exportData(format) {
    try {
      this.exportManager.exportTodayData(format);
      this.uiManager.showNotification(`Exported ${format.toUpperCase()} successfully`, 'success');
    } catch (error) {
      this.uiManager.showNotification(error.message, 'error');
    }
  }

  /**
   * Manual edit handlers
   */
  openManualEdit() {
    this.uiManager.showModal();
  }

  closeManualEdit() {
    this.uiManager.hideModal();
  }

  saveManualEntry(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const activityId = document.getElementById('editActivity').value;
    const date = document.getElementById('editDate').value;
    const startTime = document.getElementById('editStartTime').value;
    const endTime = document.getElementById('editEndTime').value;

    // Validation
    if (!activityId || !date || !startTime || !endTime) {
      this.uiManager.showNotification('Please fill in all fields', 'error');
      return;
    }

    const activity = this.activityManager.getActivity(activityId);
    if (!activity) {
      this.uiManager.showNotification('Invalid activity selected', 'error');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const duration = endDateTime - startDateTime;

    if (duration <= 0) {
      this.uiManager.showNotification('End time must be after start time', 'error');
      return;
    }

    // Create entry
    const entry = {
      activity: activityId,
      activityName: activity.name,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: duration,
      date: DateUtils.formatDate(startDateTime)
    };

    // Save entry
    this.dataManager.addEntry(entry);
    this.updateSummary();
    this.closeManualEdit();
    this.uiManager.showNotification('Manual entry saved successfully', 'success');
  }

  /**
   * Register service worker for PWA functionality
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Show update available notification
   */
  showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <div class="update-content">
        <span>New version available!</span>
        <button onclick="window.location.reload()">Update</button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }

  /**
   * Application lifecycle methods
   */
  destroy() {
    // Cleanup timers and event listeners
    this.timerManager.reset();
    // Remove event listeners if needed
  }

  /**
   * Get application state for debugging
   */
  getState() {
    return {
      isTimerActive: this.timerManager.isActive(),
      currentActivity: this.activityManager.getCurrentActivity(),
      theme: this.themeManager.getCurrentTheme(),
      entriesCount: this.dataManager.getAllEntries().length,
      todayEntriesCount: this.dataManager.getTodayEntries().length
    };
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Global app instance for debugging
  window.WorkLedgerApp = new WorkLedgerApp();
  
  // Add global error handler
  window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    // Could send to analytics service here
  });
  
  // Add unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
  });
});

// Export for module usage
export default WorkLedgerApp;
