import { DateUtils } from '../js/utils/dateUtils.js';

export class TimerDisplay {
  constructor(container) {
    this.container = container;
    this.currentTime = 0;
    this.startTime = null;
    this.interval = null;
    this.element = this.createElement();
  }

  createElement() {
    const display = document.createElement('div');
    display.className = 'timer-display';
    display.innerHTML = `
      <div class="activity-timer" id="timerValue">00:00:00</div>
      <div class="timer-controls">
        <button class="timer-btn timer-reset" title="Reset Timer" aria-label="Reset Timer">
          ⟲
        </button>
      </div>
    `;
    
    this.timerValue = display.querySelector('#timerValue');
    this.resetBtn = display.querySelector('.timer-reset');
    
    this.resetBtn.addEventListener('click', () => this.reset());
    
    return display;
  }

  start(startTime = new Date()) {
    this.startTime = startTime;
    this.update();
    this.interval = setInterval(() => this.update(), 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    return this.currentTime;
  }

  reset() {
    this.stop();
    this.currentTime = 0;
    this.startTime = null;
    this.updateDisplay('00:00:00');
  }

  update() {
    if (!this.startTime) return;
    
    this.currentTime = new Date() - this.startTime;
    const formatted = DateUtils.formatDuration(this.currentTime);
    this.updateDisplay(formatted);
  }

  updateDisplay(timeString) {
    if (this.timerValue) {
      this.timerValue.textContent = timeString;
    }
  }

  getCurrentTime() {
    return this.currentTime;
  }

  isRunning() {
    return this.interval !== null;
  }

  render(container = this.container) {
    if (container) {
      container.appendChild(this.element);
    }
    return this.element;
  }

  destroy() {
    this.stop();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
