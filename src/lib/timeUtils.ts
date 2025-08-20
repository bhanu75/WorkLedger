import { format, startOfDay, endOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export function formatAMPM(
  isoUtcString: string, 
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
): string {
  const zoned = utcToZonedTime(isoUtcString, timeZone);
  return format(zoned, 'hh:mm a');
}

export function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function parseTimeInput(timeStr: string, dateStr?: string): string {
  // Parse "09:30 AM" format and return ISO UTC
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const baseDate = dateStr ? new Date(dateStr) : new Date();
  
  // Create a date string like "2025-08-20 09:30 AM"
  const dateTimeStr = `${format(baseDate, 'yyyy-MM-dd')} ${timeStr}`;
  const localDate = new Date(dateTimeStr);
  
  return zonedTimeToUtc(localDate, timeZone).toISOString();
}

export function getTodayRange(): { start: string; end: string } {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  
  const startLocal = startOfDay(now);
  const endLocal = endOfDay(now);
  
  return {
    start: zonedTimeToUtc(startLocal, timeZone).toISOString(),
    end: zonedTimeToUtc(endLocal, timeZone).toISOString()
  };
}

export function getCurrentRunningDuration(startTs: string): number {
  return Date.now() - new Date(startTs).getTime();
}

export const SESSION_TYPES = {
  work: { label: 'Work', color: 'bg-green-500', icon: '💼' },
  break: { label: 'Break', color: 'bg-yellow-500', icon: '☕' },
  lunch: { label: 'Lunch', color: 'bg-orange-500', icon: '🍽️' },
  dinner: { label: 'Dinner', color: 'bg-red-500', icon: '🍽️' },
  tech: { label: 'Tech Issue', color: 'bg-red-600', icon: '🔧' },
  custom: { label: 'Custom', color: 'bg-gray-500', icon: '📝' }
} as const;
