import { DateUtils } from '../utils/dateUtils.js';

export class UIManager {
  constructor() {
    this.elements = this.initializeElements();
  }

  initializeElements() {
    return {
      currentActivityName: document.getElementById('currentActivityName'),
      activityTimer: document.getElementById('activityTimer'),
      activityStatus: document.getElementById('activityStatus'),
      startBtn: document.getElementById('startBtn'),
      stopBtn: document.getElementById('stopBtn'),
      activitiesGrid: document.getElementById('activitiesGrid'),
      dailySummary: document.getElementById('dailySummary'),
      editModal: document.getElementById('editModal'),
      editForm: document.getElementById('editForm'),
      editActivity: document.getElementById('editActivity'),
      editDate: document.getElementById('editDate'),
      editStartTime: document.getElementById('editStartTime'),
      editEndTime: document.getElementById('editEndTime')
    };
  }

  updateCurrentActivity(activityName = 'No Activity') {
    if (this.elements.currentActivityName) {
      this.elements.currentActivityName.textContent = activityName;
    }
  }

  updateTimer(timeString = '00:00:00') {
    if (this.elements.activityTimer) {
      this.elements.activityTimer.textContent = timeString;
    }
  }

  updateStatus(isActive = false) {
    if (!this.elements.activityStatus) return;

    const statusClass = isActive ? 'activity-status status-active' : 'activity-status status-inactive';
    const statusText = isActive ? 'Active' : 'Inactive';
    
    this.elements.activityStatus.className = statusClass;
    this.elements.activityStatus.innerHTML = `<span class="status-dot"></span><span>${statusText}</span>`;
  }

  updateControlButtons(isActive = false) {
    if (this.elements.startBtn) {
      this.elements.startBtn.disabled = isActive;
    }
    if (this.elements.stopBtn) {
      this.elements.stopBtn.disabled = !isActive;
    }
  }

  highlightActivity(activityId) {
    document.querySelectorAll('.activity-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.activity === activityId);
    });
  }

  clearActivitySelection() {
    document.querySelectorAll('.activity-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  updateSummary(entries, activities) {
    if (!this.elements.dailySummary) return;

    if (entries.length === 0) {
      this.elements.dailySummary.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⏰</div>
          <p>No activities tracked today</p>
        </div>
      `;
      return;
    }

    const summary = activities.reduce((acc, activity) => {
      const activityEntries = entries.filter(entry => entry.activity === activity.id);
      const totalDuration = activityEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      if (totalDuration > 0) {
        acc[activity.id] = {
          name: activity.name,
          icon: activity.icon,
          duration: totalDuration
        };
      }
      return acc;
    }, {});

    const summaryHTML = Object.values(summary).map(item => `
      <div class="summary-item">
        <span class="summary-name">${item.icon} ${item.name}</span>
        <span class="summary-time">${DateUtils.formatDuration(item.duration)}</span>
      </div>
    `).join('');

    this.elements.dailySummary.innerHTML = summaryHTML;
  }

  populateEditForm(activities) {
    if (!this.elements.editActivity) return;

    this.elements.editActivity.innerHTML = '<option value="">Select Activity</option>' +
      activities.map(activity => 
        `<option value="${activity.id}">${activity.name}</option>`
      ).join('');

    if (this.elements.editDate) {
      this.elements.editDate.valueAsDate = new Date();
    }
  }

  showModal() {
    if (this.elements.editModal) {
      this.elements.editModal.classList.add('show');
    }
  }

  hideModal() {
    if (this.elements.editModal) {
      this.elements.editModal.classList.remove('show');
    }
    if (this.elements.editForm) {
      this.elements.editForm.reset();
    }
  }

  showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  resetUI() {
    this.updateCurrentActivity();
    this.updateTimer();
    this.updateStatus(false);
    this.updateControlButtons(false);
    this.clearActivitySelection();
  }
}
