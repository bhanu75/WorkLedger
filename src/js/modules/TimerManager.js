import { DateUtils } from '../utils/dateUtils.js';

export class TimerManager {
  constructor(dataManager, onUpdate) {
    this.dataManager = dataManager;
    this.onUpdate = onUpdate;
    this.isRunning = false;
    this.startTime = null;
    this.currentActivity = null;
    this.timerInterval = null;
  }

  start(activity) {
    if (this.isRunning) return false;

    this.currentActivity = activity;
    this.startTime = new Date();
    this.isRunning = true;
    
    this.startTimerUpdate();
    return true;
  }

  stop() {
    if (!this.isRunning || !this.currentActivity || !this.startTime) return null;

    const endTime = new Date();
    const duration = endTime - this.startTime;

    const entry = {
      activity: this.currentActivity.id,
      activityName: this.currentActivity.name,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: duration,
      date: DateUtils.formatDate(this.startTime)
    };

    const savedEntry = this.dataManager.addEntry(entry);
    this.reset();
    
    return savedEntry;
  }

  reset() {
    this.isRunning = false;
    this.startTime = null;
    this.currentActivity = null;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  startTimerUpdate() {
    this.updateTimer();
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    if (!this.startTime || !this.onUpdate) return;
    
    const elapsed = new Date() - this.startTime;
    const formatted = DateUtils.formatDuration(elapsed);
    this.onUpdate(formatted, this.currentActivity);
  }

  getCurrentDuration() {
    if (!this.startTime) return 0;
    return new Date() - this.startTime;
  }

  isActive() {
    return this.isRunning;
  }

  getCurrentActivity() {
    return this.currentActivity;
  }
}
