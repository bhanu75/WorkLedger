import { DateUtils } from '../js/utils/dateUtils.js';

export class SummaryView {
  constructor(container) {
    this.container = container;
    this.entries = [];
    this.activities = [];
    this.element = this.createElement();
  }

  createElement() {
    const summary = document.createElement('div');
    summary.className = 'summary-view';
    summary.innerHTML = `
      <div class="summary-header">
        <h3 class="summary-title">Daily Summary</h3>
        <div class="summary-date" id="summaryDate">${new Date().toLocaleDateString()}</div>
      </div>
      <div class="summary-content" id="summaryContent">
        ${this.createEmptyState()}
      </div>
      <div class="summary-footer">
        <div class="summary-total" id="summaryTotal"></div>
      </div>
    `;
    
    this.contentElement = summary.querySelector('#summaryContent');
    this.totalElement = summary.querySelector('#summaryTotal');
    this.dateElement = summary.querySelector('#summaryDate');
    
    return summary;
  }

  createEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">⏰</div>
        <p>No activities tracked today</p>
      </div>
    `;
  }

  update(entries, activities) {
    this.entries = entries;
    this.activities = activities;
    this.render();
  }

  render() {
    if (this.entries.length === 0) {
      this.contentElement.innerHTML = this.createEmptyState();
      this.totalElement.innerHTML = '';
      return;
    }

    const summary = this.calculateSummary();
    this.contentElement.innerHTML = this.renderSummaryItems(summary);
    this.totalElement.innerHTML = this.renderTotal(summary);
  }

  calculateSummary() {
    const summary = {};
    
    this.activities.forEach(activity => {
      const activityEntries = this.entries.filter(entry => entry.activity === activity.id);
      const totalDuration = activityEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      if (totalDuration > 0) {
        summary[activity.id] = {
          activity: activity,
          duration: totalDuration,
          sessions: activityEntries.length,
          avgSession: totalDuration / activityEntries.length
        };
      }
    });
    
    return summary;
  }

  renderSummaryItems(summary) {
    return Object.values(summary).map(item => `
      <div class="summary-item" data-activity="${item.activity.id}">
        <div class="summary-item-info">
          <span class="summary-name">
            <span class="activity-icon">${item.activity.icon}</span>
            ${item.activity.name}
          </span>
          <span class="summary-sessions">${item.sessions} session${item.sessions > 1 ? 's' : ''}</span>
        </div>
        <div class="summary-item-time">
          <span class="summary-time">${DateUtils.formatDuration(item.duration)}</span>
          <span class="summary-avg">avg: ${DateUtils.formatDuration(item.avgSession)}</span>
        </div>
      </div>
    `).join('');
  }

  renderTotal(summary) {
    const totalDuration = Object.values(summary).reduce((sum, item) => sum + item.duration, 0);
    const totalSessions = Object.values(summary).reduce((sum, item) => sum + item.sessions, 0);
    
    if (totalDuration === 0) return '';
    
    return `
      <div class="summary-total-content">
        <span class="total-label">Total tracked:</span>
        <span class="total-time">${DateUtils.formatDuration(totalDuration)}</span>
        <span class="total-sessions">${totalSessions} sessions</span>
      </div>
    `;
  }

  updateDate(date = new Date()) {
    if (this.dateElement) {
      this.dateElement.textContent = date.toLocaleDateString();
    }
  }

  highlightActivity(activityId) {
    const items = this.element.querySelectorAll('.summary-item');
    items.forEach(item => {
      item.classList.toggle('highlighted', item.dataset.activity === activityId);
    });
  }

  clearHighlight() {
    const items = this.element.querySelectorAll('.summary-item');
    items.forEach(item => item.classList.remove('highlighted'));
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
