import { DateUtils } from '../utils/dateUtils.js';

export class ExportManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  exportTodayData(format) {
    const todayEntries = this.dataManager.getTodayEntries();
    
    if (todayEntries.length === 0) {
      throw new Error('No data to export for today');
    }

    switch (format.toLowerCase()) {
      case 'txt':
        return this.exportTXT(todayEntries);
      case 'csv':
        return this.exportCSV(todayEntries);
      default:
        throw new Error('Unsupported format');
    }
  }

  exportTXT(entries) {
    const today = new Date().toLocaleDateString();
    let content = `Work Ledger - ${today}\n`;
    content += '='.repeat(30) + '\n\n';

    entries.forEach(entry => {
      content += `${entry.activityName}: ${DateUtils.formatTime(entry.startTime)} - ${DateUtils.formatTime(entry.endTime)} (${DateUtils.formatDuration(entry.duration)})\n`;
    });

    const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0);
    content += `\nTotal Time: ${DateUtils.formatDuration(totalTime)}`;

    const filename = `work-ledger-${today.replace(/\//g, '-')}.txt`;
    this.downloadFile(content, filename, 'text/plain');
  }

  exportCSV(entries) {
    const headers = ['Activity', 'Start Time', 'End Time', 'Duration (HH:MM:SS)', 'Date'];
    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        `"${entry.activityName}"`,
        `"${DateUtils.formatTime(entry.startTime)}"`,
        `"${DateUtils.formatTime(entry.endTime)}"`,
        `"${DateUtils.formatDuration(entry.duration)}"`,
        `"${entry.date}"`
      ].join(','))
    ].join('\n');

    const today = new Date().toLocaleDateString().replace(/\//g, '-');
    const filename = `work-ledger-${today}.csv`;
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportDateRange(startDate, endDate, format) {
    const entries = this.dataManager.getAllEntries().filter(entry => {
      return entry.date >= startDate && entry.date <= endDate;
    });

    if (entries.length === 0) {
      throw new Error('No data to export for selected date range');
    }

    switch (format.toLowerCase()) {
      case 'txt':
        return this.exportTXT(entries);
      case 'csv':
        return this.exportCSV(entries);
      default:
        throw new Error('Unsupported format');
    }
  }
}
