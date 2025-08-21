import { ACTIVITIES } from '../utils/constants.js';

export class ActivityManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.currentActivity = null;
    this.activities = [...ACTIVITIES];
  }

  getActivities() {
    return this.activities;
  }

  getActivity(id) {
    return this.activities.find(activity => activity.id === id);
  }

  addCustomActivity(activity) {
    const newActivity = {
      id: `custom_${Date.now()}`,
      ...activity,
      isCustom: true
    };
    this.activities.push(newActivity);
    return newActivity;
  }

  removeCustomActivity(id) {
    const index = this.activities.findIndex(activity => activity.id === id && activity.isCustom);
    if (index === -1) return false;
    
    this.activities.splice(index, 1);
    return true;
  }

  selectActivity(activityId) {
    const activity = this.getActivity(activityId);
    if (!activity) return false;

    this.currentActivity = activity;
    return true;
  }

  getCurrentActivity() {
    return this.currentActivity;
  }

  clearCurrentActivity() {
    this.currentActivity = null;
  }

  renderActivities(container) {
    if (!container) return;

    container.innerHTML = this.activities.map(activity => `
      <button class="activity-btn" data-activity="${activity.id}">
        <div class="activity-icon">${activity.icon}</div>
        <div>${activity.name}</div>
      </button>
    `).join('');
  }
}
