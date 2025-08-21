export class DateUtils {
  static formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  static formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  static formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static getCurrentDate() {
    return this.formatDate(new Date());
  }

  static isToday(dateString) {
    return dateString === this.getCurrentDate();
  }
}
